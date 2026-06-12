CREATE TABLE IF NOT EXISTS olympiad_questions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_key       TEXT NOT NULL CHECK (class_key IN ('c1','c2','c3','c4','c5')),
  tier            TEXT NOT NULL CHECK (tier IN ('starter','explorer','champion','master')),
  test_index      INT  NOT NULL CHECK (test_index >= 0 AND test_index <= 9),
  question_index  INT  NOT NULL CHECK (question_index >= 0 AND question_index <= 24),
  question        TEXT NOT NULL,
  options         JSONB NOT NULL,
  correct_answer  INT  NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  hint            TEXT DEFAULT '',
  time_limit      INT  DEFAULT 45,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_key, tier, test_index, question_index)
);

CREATE INDEX IF NOT EXISTS idx_olympiad_class_tier_test
  ON olympiad_questions(class_key, tier, test_index);

ALTER TABLE olympiad_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "olympiad public read" ON olympiad_questions;
CREATE POLICY "olympiad public read"
  ON olympiad_questions FOR SELECT USING (true);
