-- players 테이블에 in1000 식별 컬럼 추가
-- isIn1000  : 오늘 기준 top 1000 안에 있는 유저면 true
-- in1000SyncAt : 마지막으로 in1000 sync된 시각

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS is_in1000      BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS in1000_sync_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_players_is_in1000 ON players (is_in1000);
