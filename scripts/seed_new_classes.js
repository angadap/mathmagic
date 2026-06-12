// Run: node scripts/seed_new_classes.js
import { createClient } from "@supabase/supabase-js";
import { C1_STARTER, C1_EXPLORER, C1_CHAMPION, C1_MASTER } from "./questions_c1.js";
import { C2_STARTER, C2_EXPLORER, C2_CHAMPION, C2_MASTER } from "./questions_c2.js";
import { C3_STARTER, C3_EXPLORER, C3_CHAMPION, C3_MASTER } from "./questions_c3.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const SEED_MAP = [
  { classKey:"c1", tier:"starter",  tests: C1_STARTER  },
  { classKey:"c1", tier:"explorer", tests: C1_EXPLORER },
  { classKey:"c1", tier:"champion", tests: C1_CHAMPION },
  { classKey:"c1", tier:"master",   tests: C1_MASTER   },
  { classKey:"c2", tier:"starter",  tests: C2_STARTER  },
  { classKey:"c2", tier:"explorer", tests: C2_EXPLORER },
  { classKey:"c2", tier:"champion", tests: C2_CHAMPION },
  { classKey:"c2", tier:"master",   tests: C2_MASTER   },
  { classKey:"c3", tier:"starter",  tests: C3_STARTER  },
  { classKey:"c3", tier:"explorer", tests: C3_EXPLORER },
  { classKey:"c3", tier:"champion", tests: C3_CHAMPION },
  { classKey:"c3", tier:"master",   tests: C3_MASTER   },
];

async function seed() {
  let total = 0;
  for (const { classKey, tier, tests } of SEED_MAP) {
    for (let ti = 0; ti < tests.length; ti++) {
      const rows = tests[ti].map((q, qi) => ({
        class_key:      classKey,
        tier,
        test_index:     ti,
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
      if (error) console.error(`ERR ${classKey}/${tier}/${ti}:`, error.message);
      else { total += rows.length; console.log(`OK  ${classKey}/${tier}/test${ti} — ${rows.length} Qs`); }
    }
  }
  console.log(`\nDone: ${total} questions seeded.`);
}

seed().catch(console.error);
