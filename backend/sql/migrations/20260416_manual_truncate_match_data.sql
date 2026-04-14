-- =============================================================================
-- MANUAL ONLY — Supabase SQL Editor. Backup first.
-- Full reset of ER-synced match rows: games, game_details, players, octagon_scores.
-- Not for CI/deploy.
-- =============================================================================
-- Drop lines for tables you do not have (e.g. game_detail_*).
-- If your DB uses "gameId"/"userId" table names, rename accordingly.
-- =============================================================================

BEGIN;

TRUNCATE TABLE
  game_detail_killers,
  game_detail_battle_zones,
  game_details,
  games,
  octagon_scores,
  players
RESTART IDENTITY CASCADE;

COMMIT;

-- Re-run daily in1000 workflow / sync_supabase_from_user_ids.py to refill.
