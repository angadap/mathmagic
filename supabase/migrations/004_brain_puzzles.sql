-- Brain puzzles table and puzzle_index columns for children + students
CREATE TABLE IF NOT EXISTS brain_puzzles (
  id serial PRIMARY KEY,
  class_num integer NOT NULL,
  seq_num integer NOT NULL,
  title text,
  description text,
  answer text,
  hint text,
  puzzle_type text,
  xp_reward integer DEFAULT 20,
  coin_reward integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  UNIQUE (class_num, seq_num)
);

ALTER TABLE children ADD COLUMN IF NOT EXISTS puzzle_index integer DEFAULT 0;
ALTER TABLE children ADD COLUMN IF NOT EXISTS last_puzzle_date text DEFAULT NULL;
ALTER TABLE students ADD COLUMN IF NOT EXISTS puzzle_index integer DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS last_puzzle_date text DEFAULT NULL;
