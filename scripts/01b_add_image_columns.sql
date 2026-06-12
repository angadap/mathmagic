-- ============================================================
-- MathMagic — Image Columns Patch
-- Run AFTER 01_word_problems_migration.sql
-- Run BEFORE 02_seed_batch1.sql
-- ============================================================

-- ── Add question_type column ─────────────────────────────────
-- 'text'  = plain text question (Class 1 onwards)
-- 'emoji' = emoji visual in image_data + text question below
-- 'image' = future: real image URL in image_data
ALTER TABLE word_problems
  ADD COLUMN IF NOT EXISTS question_type TEXT NOT NULL DEFAULT 'text'
  CHECK (question_type IN ('text', 'emoji', 'image'));

-- ── Add image_data column ────────────────────────────────────
-- For 'emoji' type:
--   Style B (Nursery): pipe-separated scene lines
--     e.g. "🌳 🐦🐦🐦|🌳 🐦🐦|Left tree|Right tree"
--   Style F (Jr KG / Sr KG): single emoji sentence
--     e.g. "🍎🍎🍎 ➕ 🍎🍎 ＝ ？"
-- For 'image' type (future): URL string
-- For 'text' type: NULL
ALTER TABLE word_problems
  ADD COLUMN IF NOT EXISTS image_data TEXT DEFAULT NULL;

-- ── No new RLS policies needed ───────────────────────────────
-- Existing policies on word_problems already cover these columns:
--   SELECT open to anon + authenticated
--   INSERT/UPDATE/DELETE restricted to service_role

-- ============================================================
-- Patch complete. Run 02_seed_batch1.sql next.
-- ============================================================
