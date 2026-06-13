// scripts/seed_boss_questions.js
// Run: node scripts/seed_boss_questions.js
// Run with clear: node scripts/seed_boss_questions.js --clear
// Single file: node scripts/seed_boss_questions.js boss_questions_ALL.json
// Requires: SUPABASE_URL and SUPABASE_SERVICE_KEY in .env

require('dotenv').config({ path: ['.env.local', '.env'] });
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

async function sbQuery(url, method, body) {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  };
  if (method === 'POST') headers['Prefer'] = 'return=minimal';

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${url}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${res.status}: ${text.slice(0, 300)}`);
  }
  if (method === 'GET') return res.json();
  return null;
}

async function clearBossQuestions() {
  console.log('🗑️  Clearing existing boss questions...');
  // Supabase REST DELETE requires filter as query param — lesson_id starts with "boss_"
  await sbQuery('questions?lesson_id=like.boss_*', 'DELETE');
  console.log('✅ Cleared.');
}

async function seedFile(filename) {
  // Try multiple locations: absolute, project root, scripts/ dir, cwd
  const candidates = path.isAbsolute(filename)
    ? [filename]
    : [
        path.join(process.cwd(), filename),
        path.join(__dirname, filename),
        path.join(__dirname, '..', filename),
        filename,
      ];

  const filepath = candidates.find(p => fs.existsSync(p));
  if (!filepath) {
    console.log(`⚠️  File not found (tried: ${candidates.join(', ')}), skipping`);
    return 0;
  }

  const questions = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  console.log(`  📄 Loaded ${questions.length} questions from ${path.basename(filepath)}`);

  // Normalize to match questions table schema
  const normalized = questions.map(q => ({
    lesson_id: q.lesson_id,
    set_index: q.set_index ?? 0,
    question_index: q.question_index,
    question: q.question,
    options: q.options,
    correct_answer: q.correct_answer,
    hint: q.hint || '',
  }));

  const CHUNK_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < normalized.length; i += CHUNK_SIZE) {
    const chunk = normalized.slice(i, i + CHUNK_SIZE);
    try {
      await sbQuery('questions', 'POST', chunk);
      inserted += chunk.length;
      process.stdout.write(`  ⬆️  ${inserted}/${normalized.length} inserted...\r`);
    } catch (err) {
      console.error(`\n  ❌ Chunk error at index ${i}: ${err.message.slice(0, 200)}`);
      // Retry one by one
      for (const q of chunk) {
        try {
          await sbQuery('questions', 'POST', [q]);
          inserted++;
        } catch (e2) {
          console.error(`  ⚠️  Skipped (${q.lesson_id}[${q.question_index}]): ${e2.message.slice(0, 100)}`);
        }
      }
    }
  }

  return inserted;
}

async function main() {
  const args = process.argv.slice(2);
  const clearFirst = args.includes('--clear');
  const jsonArgs = args.filter(a => a.endsWith('.json'));

  if (clearFirst) {
    await clearBossQuestions();
  }

  // If specific files passed, use those — otherwise default list
  const files = jsonArgs.length > 0 ? jsonArgs : [
    'boss_questions_part1.json',
    'boss_questions_part2.json',
    'boss_questions_part3.json',
    'boss_questions_part4.json',
    'boss_questions_part5.json',
    'boss_questions_part6.json',
    'boss_questions_part7.json',
    'boss_questions_part8.json',
  ];

  let grandTotal = 0;
  for (const file of files) {
    console.log(`\n📦 Seeding ${file}...`);
    const count = await seedFile(file);
    console.log(`  ✅ Done: ${count} questions inserted`);
    grandTotal += count;
  }

  console.log(`\n🎉 Total seeded: ${grandTotal} questions`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});