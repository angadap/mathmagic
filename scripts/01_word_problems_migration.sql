-- ============================================================
-- MathMagic — Word Problems Migration
-- Run this in Supabase SQL Editor BEFORE deploying app changes
-- ============================================================

-- ── 1. word_problems table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS word_problems (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_num      INTEGER NOT NULL CHECK (class_num IN (1,2,3,4,5,10,11,12)),
  problem_num    INTEGER NOT NULL CHECK (problem_num BETWEEN 1 AND 100),
  question       TEXT NOT NULL,
  options        JSONB NOT NULL,   -- array of 4 strings e.g. ["8","9","7","21"]
  correct_index  INTEGER NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  hint           TEXT NOT NULL,
  explanation    TEXT NOT NULL,    -- shown after 3rd wrong attempt
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (class_num, problem_num)
);

-- ── RLS for word_problems ────────────────────────────────────
ALTER TABLE word_problems ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + authenticated) can read problems
CREATE POLICY "word_problems_select_public"
  ON word_problems FOR SELECT
  USING (true);

-- Only service role can insert
CREATE POLICY "word_problems_insert_service"
  ON word_problems FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Only service role can update
CREATE POLICY "word_problems_update_service"
  ON word_problems FOR UPDATE
  USING (auth.role() = 'service_role');

-- Only service role can delete
CREATE POLICY "word_problems_delete_service"
  ON word_problems FOR DELETE
  USING (auth.role() = 'service_role');

-- ── 2. word_problem_index on students table ──────────────────
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS word_problem_index INTEGER NOT NULL DEFAULT 0;

-- ── 3. word_problem_index on children table ──────────────────
ALTER TABLE children
  ADD COLUMN IF NOT EXISTS word_problem_index INTEGER NOT NULL DEFAULT 0;

-- ── 4. Index for fast lookup ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_word_problems_class_num
  ON word_problems (class_num, problem_num);

-- ============================================================
-- Migration complete. Run Seed Batch 1 next.
-- ============================================================
