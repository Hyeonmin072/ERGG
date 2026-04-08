-- best_weapon(id) ↔ WeaponTypeInfo.type 영문 식별자
ALTER TABLE weapon
ADD COLUMN IF NOT EXISTS "nameEn" TEXT;

COMMENT ON COLUMN weapon."nameEn" IS 'WeaponTypeInfo type 문자열 (예: Glove, OneHandSword). id는 1-based best_weapon 코드';
