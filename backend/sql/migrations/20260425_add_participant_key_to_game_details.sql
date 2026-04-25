-- game_details 참가자 중복 방지 키
-- 규칙: game_id(10자리) + team_number(2자리) + character_num(3자리) = 15자리 문자열

ALTER TABLE game_details
    ADD COLUMN IF NOT EXISTS participant_key TEXT;

-- 기존 데이터 백필 (숫자 -> 고정 폭 문자열)
UPDATE game_details
SET participant_key =
    LPAD(COALESCE(game_id, 0)::TEXT, 10, '0')
    || LPAD(COALESCE(team_number, 0)::TEXT, 2, '0')
    || LPAD(COALESCE(character_num, 0)::TEXT, 3, '0')
WHERE participant_key IS NULL;

-- 길이 보장 (nullable 허용)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ck_game_details_participant_key_len'
    ) THEN
        ALTER TABLE game_details
            ADD CONSTRAINT ck_game_details_participant_key_len
            CHECK (participant_key IS NULL OR char_length(participant_key) = 15);
    END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_game_details_participant_key
    ON game_details (participant_key);

CREATE INDEX IF NOT EXISTS idx_game_details_participant_key
    ON game_details (participant_key);

COMMENT ON COLUMN game_details.participant_key
    IS '15자리 참가자 키: game_id(10) + team_number(2) + character_num(3)';
