// Run: node scripts/seed_olympiad_existing.js
import { createClient } from "@supabase/supabase-js";
import { OLYMPIAD_TESTS } from "../src/constants/olympiadData.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Map existing 30 tests into tier structure
const SEED_MAP = [
  // c4 starter: tests 0-9
  ...Array.from({length:10}, (_,i) => ({ classKey:"c4", tier:"starter", tierIndex:i, srcIndex:i })),
  // c4 explorer: tests 10-19
  ...Array.from({length:10}, (_,i) => ({ classKey:"c4", tier:"explorer", tierIndex:i, srcIndex:i+10 })),
  // c5 champion: tests 20-24
  ...Array.from({length:5},  (_,i) => ({ classKey:"c5", tier:"champion", tierIndex:i, srcIndex:i+20 })),
  // c5 master: tests 25-29
  ...Array.from({length:5},  (_,i) => ({ classKey:"c5", tier:"master",   tierIndex:i, srcIndex:i+25 })),
];

async function seed() {
  let total = 0;
  for (const { classKey, tier, tierIndex, srcIndex } of SEED_MAP) {
    const test = OLYMPIAD_TESTS[srcIndex];
    if (!test) { console.warn(`No test at index ${srcIndex}`); continue; }
    const rows = test.map((q, qi) => ({
      class_key:      classKey,
      tier,
      test_index:     tierIndex,
      question_index: qi,
      question:       q.q,
      options:        q.opts,
      correct_answer: q.ans,
      hint:           q.h || "",
      time_limit:     q.time || 45,
    }));
    const { error } = await supabase
      .from("olympiad_questions")
      .upsert(rows, { onConflict: "class_key,tier,test_index,question_index" });
    if (error) console.error(`  ERR ${classKey}/${tier}/${tierIndex}:`, error.message);
    else { total += rows.length; console.log(`  OK  ${classKey}/${tier}/test${tierIndex} — ${rows.length} Qs`); }
  }
  console.log(`\nDone: ${total} questions seeded.`);
}

seed().catch(console.error);
