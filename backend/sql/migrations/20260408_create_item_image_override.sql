-- Manual override table for item image mapping
-- Use this when automatic mapping is unavailable or incorrect.

CREATE TABLE IF NOT EXISTS item_image_override (
    id          BIGSERIAL PRIMARY KEY,
    type        TEXT NOT NULL CHECK (type IN ('weapon', 'armor')),
    code        BIGINT NOT NULL,
    image_path  TEXT NOT NULL,
    name_en     TEXT,
    note        TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_item_image_override_type_code UNIQUE (type, code)
);

CREATE INDEX IF NOT EXISTS idx_item_image_override_type_code
    ON item_image_override (type, code);

COMMENT ON TABLE item_image_override IS 'manual overrides for item image_path/name_en';
COMMENT ON COLUMN item_image_override.image_path IS 'frontend public image path (/images/...)';
