-- Normalized nickname: at sync time only one players row holds a given nickname_key
-- (others get NULL). Nickname recycle does not move game_details.
-- Non-unique index (legacy duplicates ok).

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS nickname_key TEXT;

UPDATE players
SET nickname_key = lower(trim(nickname))
WHERE (nickname_key IS NULL OR nickname_key = '')
  AND nickname IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_players_nickname_key ON players (nickname_key);
