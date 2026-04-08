-- CharacterAttributes API의 mastery(영문 타입) → game_details.bestWeapon(WeaponTypeInfo 1-based 코드) 배열
ALTER TABLE "character"
ADD COLUMN IF NOT EXISTS "masteryWeaponCodes" BIGINT[] NOT NULL DEFAULT '{}'::BIGINT[];

COMMENT ON COLUMN "character"."masteryWeaponCodes" IS '캐릭터가 선택 가능한 무기 타입 코드(best_weapon / WeaponTypeInfo 순서, 1-based). /v2/data/CharacterAttributes의 mastery 매핑';
