// api/boss.js — Vercel Serverless Function
// Boss battle: fetch questions, save results, get progress.

const SB_URL     = process.env.SUPABASE_URL;
const SB_SERVICE = process.env.SUPABASE_SERVICE_KEY;

const ALLOWED_ORIGINS = [
  "https://mathmagic-virid.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

function setSecurityHeaders(res, origin) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cache-Control", "no-store");
}

const UUID_RE     = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (s) => typeof s === "string" && UUID_RE.test(s);
const sanitizeStr = (s, max = 200) => typeof s === "string" ? s.replace(/[<>]/g, "").slice(0, max).trim() : "";
const sanitizeInt = (n, min, max) => { const i = parseInt(n); return isNaN(i) ? min : Math.min(Math.max(i, min), max); };

const rateLimitMap = new Map();
function rateLimit(ip, action, maxReq, windowMs) {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const e = rateLimitMap.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > e.resetAt) { e.count = 0; e.resetAt = now + windowMs; }
  e.count++;
  rateLimitMap.set(key, e);
  if (e.count > maxReq) return { limited: true, retryAfter: Math.ceil((e.resetAt - now) / 1000) };
  return { limited: false };
}

const LIMITS = {
  get_questions: { max: 120, windowMs: 60 * 1000 },
  save_result:   { max: 60,  windowMs: 60 * 1000 },
  get_progress:  { max: 60,  windowMs: 60 * 1000 },
  default:       { max: 60,  windowMs: 60 * 1000 },
};

async function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const res = await fetch(`${SB_URL}/auth/v1/user`, {
      headers: { apikey: SB_SERVICE, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function sbQuery(table, method, body, params = "") {
  const res = await fetch(`${SB_URL}/rest/v1/${table}${params}`, {
    method,
    headers: {
      apikey: SB_SERVICE,
      Authorization: `Bearer ${SB_SERVICE}`,
      "Content-Type": "application/json",
      Prefer: method === "POST" ? "return=representation" : "return=minimal",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(txt) }; }
  catch { return { ok: res.ok, status: res.status, data: txt }; }
}

async function childBelongsToUser(childId, userId) {
  if (!isValidUUID(childId) || !isValidUUID(userId)) return false;
  const r = await sbQuery("children", "GET", null,
    `?id=eq.${encodeURIComponent(childId)}&parent_id=eq.${encodeURIComponent(userId)}&select=id`);
  return Array.isArray(r.data) && r.data.length > 0;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  setSecurityHeaders(res, origin);

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    return res.status(200).end();
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (origin && !ALLOWED_ORIGINS.includes(origin) && !origin.includes("localhost")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
  const { action } = req.body || {};
  if (!action) return res.status(400).json({ error: "Missing action" });

  const limit = LIMITS[action] || LIMITS.default;
  const { limited, retryAfter } = rateLimit(ip, action, limit.max, limit.windowMs);
  if (limited) return res.status(429).json({ error: `Rate limit exceeded. Wait ${retryAfter}s.`, retryAfter });

  const token = req.headers.authorization?.replace("Bearer ", "").trim();

  try {
    // ── PUBLIC: get_questions — no JWT required ──────────────────────────
    if (action === "get_questions") {
      const lesson_id = sanitizeStr(req.body.lesson_id, 60);
      if (!lesson_id) return res.status(400).json({ error: "lesson_id required" });
      const r = await sbQuery("questions", "GET", null,
        `?lesson_id=eq.${encodeURIComponent(lesson_id)}&order=random()&limit=20`);
      return res.status(200).json({ data: Array.isArray(r.data) ? r.data : [] });
    }

    // ── AUTHENTICATED actions ────────────────────────────────────────────
    const user = await verifyToken(token);
    if (!user?.id) return res.status(401).json({ error: "Unauthorized — please log in" });

    // ── save_result ──────────────────────────────────────────────────────
    if (action === "save_result") {
      const { child_id, boss_key, level_key, killed,
              xp_earned, coins_earned, gems_earned, time_taken_sec } = req.body;

      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      if (!(await childBelongsToUser(child_id, user.id))) return res.status(403).json({ error: "Forbidden" });

      const bossKey  = sanitizeStr(boss_key, 20);
      const levelKey = sanitizeStr(level_key, 20);
      if (!bossKey || !levelKey) return res.status(400).json({ error: "boss_key and level_key required" });

      const xp    = sanitizeInt(xp_earned, 0, 9999);
      const coins = sanitizeInt(coins_earned, 0, 9999);
      const gems  = sanitizeInt(gems_earned, 0, 9999);
      const secs  = sanitizeInt(time_taken_sec, 0, 9999);
      const won   = !!killed;

      // Check for existing row
      const existing = await sbQuery("boss_battles", "GET", null,
        `?child_id=eq.${encodeURIComponent(child_id)}&boss_key=eq.${encodeURIComponent(bossKey)}&level_key=eq.${encodeURIComponent(levelKey)}&select=id,attempts,killed`);
      const row = Array.isArray(existing.data) ? existing.data[0] : null;

      if (row) {
        // UPDATE: always increment attempts; only overwrite rewards if newly killed
        const patch = { attempts: (row.attempts || 1) + 1 };
        if (won && !row.killed) {
          patch.killed       = true;
          patch.xp_earned    = xp;
          patch.coins_earned = coins;
          patch.gems_earned  = gems;
          patch.time_taken_sec = secs;
          patch.killed_at    = new Date().toISOString();
        }
        await sbQuery("boss_battles", "PATCH", patch,
          `?child_id=eq.${encodeURIComponent(child_id)}&boss_key=eq.${encodeURIComponent(bossKey)}&level_key=eq.${encodeURIComponent(levelKey)}`);
      } else {
        // INSERT
        await sbQuery("boss_battles", "POST", {
          child_id,
          boss_key:      bossKey,
          level_key:     levelKey,
          killed:        won,
          attempts:      1,
          xp_earned:     xp,
          coins_earned:  coins,
          gems_earned:   gems,
          time_taken_sec: secs,
          killed_at:     won ? new Date().toISOString() : null,
          created_at:    new Date().toISOString(),
        });
      }

      // Award rewards to child if they just won (first kill OR existing row that wasn't killed before)
      const isFirstKill = won && (!row || !row.killed);
      if (isFirstKill) {
        const cur = await sbQuery("children", "GET", null,
          `?id=eq.${encodeURIComponent(child_id)}&select=xp,coins,gems`);
        const c = Array.isArray(cur.data) ? cur.data[0] : {};
        await sbQuery("children", "PATCH", {
          xp:    Math.min((c.xp    || 0) + xp,    999999),
          coins: Math.min((c.coins || 0) + coins,  999999),
          gems:  Math.min((c.gems  || 0) + gems,   999999),
        }, `?id=eq.${encodeURIComponent(child_id)}`);
      }

      return res.status(200).json({ ok: true });
    }

    // ── get_progress ─────────────────────────────────────────────────────
    if (action === "get_progress") {
      const { child_id } = req.body;
      if (!isValidUUID(child_id)) return res.status(400).json({ error: "Invalid child_id" });
      if (!(await childBelongsToUser(child_id, user.id))) return res.status(403).json({ error: "Forbidden" });

      const r = await sbQuery("boss_battles", "GET", null,
        `?child_id=eq.${encodeURIComponent(child_id)}&order=created_at.desc`);
      return res.status(200).json({ data: Array.isArray(r.data) ? r.data : [] });
    }

    return res.status(400).json({ error: "Unknown action" });

  } catch (err) {
    console.error("[boss API error]", err.message);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
