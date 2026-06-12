/**
 * seed_brain_puzzles.js
 * Node.js port of seed_brain_puzzles.py — reads the Python file,
 * extracts the PUZZLES array, and seeds brain_puzzles via Supabase REST API.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const SB_URL = process.env.SUPABASE_URL || "https://vsfvvzcvhhibepinphtk.supabase.co";
const SB_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const TABLE  = "brain_puzzles";

if (!SB_KEY) {
  console.error("❌  Set SUPABASE_SERVICE_KEY env var before running.");
  process.exit(1);
}

// ── Parse PUZZLES tuples from the Python file ──────────────────────────────
function parsePythonPuzzles(filePath) {
  const src = fs.readFileSync(filePath, "utf8");

  // Extract the block between PUZZLES = [ and the closing ]
  const start = src.indexOf("PUZZLES = [");
  const end   = src.lastIndexOf("\n]");
  if (start === -1 || end === -1) throw new Error("Could not find PUZZLES list in Python file.");

  const block = src.slice(start + "PUZZLES = [".length, end);

  const puzzles = [];
  // Match each tuple: (int, int, "str","str","str","str","str", int, int)
  // Fields may contain escaped quotes, newlines (\n), unicode emoji, etc.
  // Strategy: find each line that starts with ( and an integer, then extract.

  // We'll do a simple state-machine parser on the block character by character.
  let i = 0;
  while (i < block.length) {
    // Skip until we find a '(' that starts a tuple
    if (block[i] !== "(") { i++; continue; }

    // Try to read a complete tuple
    let depth = 0;
    let inStr  = false;
    let strChar = "";
    let j = i;
    while (j < block.length) {
      const c = block[j];
      if (inStr) {
        if (c === "\\" ) { j += 2; continue; } // skip escaped char
        if (c === strChar) inStr = false;
      } else {
        if (c === '"' || c === "'") { inStr = true; strChar = c; }
        else if (c === "(") depth++;
        else if (c === ")") { depth--; if (depth === 0) { j++; break; } }
      }
      j++;
    }
    const tupleStr = block.slice(i, j).trim();

    // Only process if it looks like a puzzle tuple (starts with a digit after '(')
    const inner = tupleStr.slice(1, -1); // strip outer parens
    // Parse as CSV-like, respecting strings
    const fields = splitTuple(inner);
    if (fields.length >= 9) {
      const classNum   = parseInt(fields[0]);
      const seqNum     = parseInt(fields[1]);
      const title      = unquote(fields[2]);
      const desc       = unquote(fields[3]);
      const answer     = unquote(fields[4]);
      const hint       = unquote(fields[5]);
      const puzzleType = unquote(fields[6]);
      const xp         = parseInt(fields[7]);
      const coins      = parseInt(fields[8]);

      if (!isNaN(classNum) && !isNaN(seqNum)) {
        puzzles.push({ classNum, seqNum, title, desc, answer, hint, puzzleType, xp, coins });
      }
    }
    i = j;
  }
  return puzzles;
}

function splitTuple(inner) {
  const fields = [];
  let current  = "";
  let inStr    = false;
  let strChar  = "";
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (inStr) {
      if (c === "\\" && i + 1 < inner.length) {
        const next = inner[i + 1];
        if (next === "n") { current += "\n"; i++; }
        else if (next === "t") { current += "\t"; i++; }
        else if (next === "\\" ) { current += "\\"; i++; }
        else if (next === strChar) { current += strChar; i++; }
        else { current += c + next; i++; }
      } else if (c === strChar) {
        inStr = false;
      } else {
        current += c;
      }
    } else {
      if (c === '"' || c === "'") { inStr = true; strChar = c; }
      else if (c === ",") { fields.push(current.trim()); current = ""; }
      else { current += c; }
    }
  }
  if (current.trim()) fields.push(current.trim());
  return fields;
}

function unquote(s) {
  s = s.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

// ── HTTP POST to Supabase ──────────────────────────────────────────────────
function sbPost(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const url = new URL(`${SB_URL}/rest/v1/${path}`);
    const options = {
      hostname: url.hostname,
      path:     url.pathname + url.search,
      method:   "POST",
      headers: {
        "apikey":        SB_KEY,
        "Authorization": `Bearer ${SB_KEY}`,
        "Content-Type":  "application/json",
        "Prefer":        "return=minimal",
        "Content-Length": Buffer.byteLength(payload),
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// ── Main ───────────────────────────────────────────────────────────────────
async function seed() {
  const pyFile = path.join(__dirname, "seed_brain_puzzles.py");
  console.log(`📖  Parsing puzzles from ${pyFile} ...`);
  const puzzles = parsePythonPuzzles(pyFile);
  console.log(`🧩  Found ${puzzles.length} puzzles across 8 class levels.\n`);

  const BATCH = 50;
  let totalOk = 0;

  for (let b = 0; b < puzzles.length; b += BATCH) {
    const batch = puzzles.slice(b, b + BATCH);
    const rows  = batch.map((p) => ({
      class_num:   p.classNum,
      seq_num:     p.seqNum,
      title:       p.title,
      description: p.desc,
      answer:      p.answer,
      hint:        p.hint,
      puzzle_type: p.puzzleType,
      xp_reward:   p.xp,
      coin_reward: p.coins,
    }));

    const batchNum = Math.floor(b / BATCH) + 1;
    const total    = Math.ceil(puzzles.length / BATCH);
    const { status, body } = await sbPost(`${TABLE}?on_conflict=class_num,seq_num`, rows);

    if (status === 200 || status === 201) {
      totalOk += batch.length;
      console.log(`  ✅  Batch ${batchNum}/${total} — ${batch.length} rows upserted (running total: ${totalOk})`);
    } else {
      console.log(`  ❌  Batch ${batchNum}/${total} failed — HTTP ${status}: ${body.slice(0, 300)}`);
    }
  }

  console.log(`\n${totalOk === puzzles.length ? "✅" : "⚠️ "}  Done. ${totalOk}/${puzzles.length} puzzles seeded.`);

  if (totalOk > 0) {
    // Show count per class_num
    console.log("\n📊  Count per class_num:");
    const counts = {};
    puzzles.forEach((p) => { counts[p.classNum] = (counts[p.classNum] || 0) + 1; });
    const labels = { 10: "Nursery", 11: "Jr KG", 12: "Sr KG", 1: "Class 1", 2: "Class 2", 3: "Class 3", 4: "Class 4", 5: "Class 5" };
    Object.keys(counts).sort((a, b) => {
      const order = [10, 11, 12, 1, 2, 3, 4, 5];
      return order.indexOf(+a) - order.indexOf(+b);
    }).forEach((k) => {
      console.log(`    class_num=${k.padEnd(3)} (${(labels[k] || "").padEnd(8)}) → ${counts[k]} puzzles`);
    });
  }
}

seed().catch((err) => { console.error("Fatal:", err); process.exit(1); });
