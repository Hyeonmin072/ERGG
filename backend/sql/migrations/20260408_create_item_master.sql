-- Item master table for equipment metadata
-- type: weapon | armor
-- kind: weapon type (e.g. Dagger) / armor slot (Head, Chest, Arm, Leg)
-- name_kr/name_en: locale display names
-- code: item code from ER data tables

CREATE TABLE IF NOT EXISTS item (
    id          BIGSERIAL PRIMARY KEY,
    type        TEXT NOT NULL CHECK (type IN ('weapon', 'armor')),
    kind        TEXT NOT NULL,
    name_kr     TEXT NOT NULL,
    name_en     TEXT,
    image_path  TEXT,
    code        BIGINT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_item_type_code UNIQUE (type, code)
);

-- 기존 item 테이블(name 컬럼)에서 넘어오는 경우 보정
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'item' AND column_name = 'name'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'item' AND column_name = 'name_kr'
    ) THEN
        EXECUTE 'ALTER TABLE item RENAME COLUMN name TO name_kr';
    END IF;
END
$$;

ALTER TABLE item
    ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE item
    ADD COLUMN IF NOT EXISTS image_path TEXT;

CREATE INDEX IF NOT EXISTS idx_item_type_kind ON item (type, kind);
CREATE INDEX IF NOT EXISTS idx_item_name_kr   ON item (name_kr);
CREATE INDEX IF NOT EXISTS idx_item_name_en   ON item (name_en);

COMMENT ON TABLE item IS 'ER item master (weapon/armor)';
COMMENT ON COLUMN item.type IS 'weapon | armor';
COMMENT ON COLUMN item.kind IS 'weapon group or armor slot';
COMMENT ON COLUMN item.name_kr IS 'korean display name';
COMMENT ON COLUMN item.name_en IS 'english display name';
COMMENT ON COLUMN item.image_path IS 'frontend public image path (/images/...)';
COMMENT ON COLUMN item.code IS 'ER item code';
