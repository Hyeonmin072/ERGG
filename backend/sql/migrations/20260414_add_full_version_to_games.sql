-- games 테이블에 fullVersion 생성 컬럼 추가
-- 형식: seasonId.versionMajor.versionMinor  (예: 37.6.0)

ALTER TABLE games
  ADD COLUMN IF NOT EXISTS full_version VARCHAR(30)
    GENERATED ALWAYS AS (
      season_id::TEXT || '.' || version_major::TEXT || '.' || version_minor::TEXT
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_games_full_version ON games (full_version);
