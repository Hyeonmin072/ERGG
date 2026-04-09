-- 전술 스킬 그룹 마스터 (ER TacticalSkillSetGroup.group = userGames.tacticalSkillGroup)
-- 이름: l10n Skill/Group/Name/{icon 베이스} 기준 (패치 시 시드 재실행 또는 수동 갱신)

CREATE TABLE IF NOT EXISTS tactical_skill_group (
    code        BIGINT PRIMARY KEY,
    name_kr     TEXT NOT NULL,
    name_en     TEXT,
    "modeType"  TEXT,
    "icon"      TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tactical_skill_group_mode ON tactical_skill_group ("modeType");

COMMENT ON TABLE tactical_skill_group IS 'ER TacticalSkillSetGroup — tacticalSkillGroup 코드별 표시명';
COMMENT ON COLUMN tactical_skill_group.code IS 'TacticalSkillSetGroup.group / userGames.tacticalSkillGroup';
COMMENT ON COLUMN tactical_skill_group.name_kr IS '한국어 이름 (l10n)';
COMMENT ON COLUMN tactical_skill_group.name_en IS '영어 이름 (l10n)';
COMMENT ON COLUMN tactical_skill_group."modeType" IS 'ER API modeType (예: 1,2,3,5,6 또는 4)';
COMMENT ON COLUMN tactical_skill_group."icon" IS 'ER 리소스 아이콘 키 (VSkillIcon_… 등)';

INSERT INTO tactical_skill_group (code, name_kr, name_en, "modeType", "icon") VALUES
    (30, '블링크', 'Blink', '1,2,3,5,6', 'VSkillIcon_4000000'),
    (40, '퀘이크', 'Quake', '1,2,3,5,6', 'VSkillIcon_4001000'),
    (50, '프로토콜 위반', 'Protocol Violation', '1,2,3,5,6', 'VSkillIcon_4101000'),
    (60, '붉은 폭풍', 'Electric Shift', '1,2,3,5,6', 'VSkillIcon_4102000'),
    (70, '초월', 'Force Field', '1,2,3,5,6', 'VSkillIcon_4103000'),
    (80, '아티팩트', 'Totem', '1,2,3,5,6', 'VSkillIcon_4104000'),
    (90, '무효화', 'Nullification', '1,2,3,5,6', 'VSkillIcon_4105000'),
    (110, '강한 결속', 'Soul Stealer', '1,2,3,5,6', 'VSkillIcon_4107000'),
    (120, '스트라이더 - A13', 'The Strijder', '1,2,3,5,6', 'VSkillIcon_4110000'),
    (130, '진실의 칼날', 'Blade of Truth', '1,2,3,5,6', 'VSkillIcon_4112000'),
    (140, '거짓 서약', 'False Oath', '1,2,3,5,6', 'VSkillIcon_4113000'),
    (150, '치유의 바람', 'Healing Wind', '1,2,3,5,6', 'VSkillIcon_4108000'),
    (500010, '블레싱: 명상', 'Blessing: Calm Mind', '4', 'VSkillIcon_4511000'),
    (500020, '중력장', 'Gravitational Field', '4', 'VSkillIcon_4502000'),
    (500030, '롤링썬더', 'Rolling Thunder', '4', 'VSkillIcon_4503000'),
    (500040, '폭진', 'Truth Explosion', '4', 'VSkillIcon_4504000'),
    (500050, '블링크', 'Blink', '4', 'VSkillIcon_4512000'),
    (500060, '기원', 'Prayer', '4', 'VSkillIcon_4506000'),
    (500070, '대지분쇄', 'Fissure', '4', 'VSkillIcon_4507000'),
    (500080, '힘껏 펀치', 'Fantastical Punch', '4', 'VSkillIcon_4508000'),
    (500090, '메테오', 'Meteor', '4', 'VSkillIcon_4509000'),
    (500100, '라이트닝 쉴드', 'Lightning Shield', '4', 'VSkillIcon_4510000'),
    (500110, '블레싱: 명상', 'Blessing: Calm Mind', '4', 'VSkillIcon_4511000'),
    (500120, '블링크', 'Blink', '4', 'VSkillIcon_4000000'),
    (500130, '퀘이크', 'Quake', '4', 'VSkillIcon_4001000'),
    (500140, '프로토콜 위반', 'Protocol Violation', '4', 'VSkillIcon_4101000'),
    (500150, '붉은 폭풍', 'Electric Shift', '4', 'VSkillIcon_4102000'),
    (500160, '초월', 'Force Field', '4', 'VSkillIcon_4103000'),
    (500170, '아티팩트', 'Totem', '4', 'VSkillIcon_4104000'),
    (500180, '무효화', 'Nullification', '4', 'VSkillIcon_4105000'),
    (500190, '강한 결속', 'Soul Stealer', '4', 'VSkillIcon_4107000'),
    (500200, '스트라이더 - A13', 'The Strijder', '4', 'VSkillIcon_4110000'),
    (500210, '진실의 칼날', 'Blade of Truth', '4', 'VSkillIcon_4112000'),
    (500220, '거짓 서약', 'False Oath', '4', 'VSkillIcon_4113000'),
    (500230, '치유의 바람', 'Healing Wind', '4', 'VSkillIcon_4108000'),
    (500240, '부착', 'Lock On', '4', 'VSkillIcon_4524000'),
    (1000000, '하이퍼루프', 'Hyperloop', '4', 'SkillIcon_1060000')
ON CONFLICT (code) DO UPDATE SET
    name_kr     = EXCLUDED.name_kr,
    name_en     = EXCLUDED.name_en,
    "modeType"  = EXCLUDED."modeType",
    "icon"      = EXCLUDED."icon",
    "updatedAt" = NOW();
