-- Existing item table migration:
-- - rename legacy "name" -> "name_kr"
-- - add "name_en", "image_path"

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

-- index migration
DROP INDEX IF EXISTS idx_item_name;
CREATE INDEX IF NOT EXISTS idx_item_name_kr ON item (name_kr);
CREATE INDEX IF NOT EXISTS idx_item_name_en ON item (name_en);

COMMENT ON COLUMN item.name_kr IS 'korean display name';
COMMENT ON COLUMN item.name_en IS 'english display name';
COMMENT ON COLUMN item.image_path IS 'frontend public image path (/images/...)';
