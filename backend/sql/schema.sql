-- ============================================================
-- Eternal Return 전적 검색 서비스 - PostgreSQL 스키마
-- Database: ergg_db
-- 컬럼명: Eternal Return API와 동일한 camelCase (식별자는 "큰따옴표" 사용)
--
-- 운영 DB가 기존 snake_case 컬럼이면 이 스크립트를 그대로 실행하지 말고,
-- 덤프/재생성 또는 컬럼별 RENAME 마이그레이션을 먼저 수행하세요.
-- ============================================================


-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE matching_mode_type AS ENUM ('2', '3');          -- 2=일반, 3=랭크
CREATE TYPE matching_team_mode_type AS ENUM ('1', '2', '3'); -- 1=솔로, 3=스쿼드 (ER 본가; 2는 API/레거시 값 가능)

-- ============================================================
-- 0. static data (캐릭터 / 무기 마스터)
-- ============================================================
CREATE TABLE IF NOT EXISTS weapon (
    id          BIGINT PRIMARY KEY,
    name        TEXT NOT NULL,   -- 한글 표시 (통계/UI 단일 기준, best_weapon 코드 = id)
    "nameEn"    TEXT             -- WeaponTypeInfo.type 영문; 동일 nameEn이 여러 id에 있을 수 있음
);

CREATE TABLE IF NOT EXISTS character (
    id              BIGSERIAL PRIMARY KEY,
    "characterNum"  BIGINT UNIQUE NOT NULL,
    name            TEXT NOT NULL,      -- 한국어 우선
    "nameKo"        TEXT,
    "nameEn"        TEXT,
    "weaponType"    BIGINT,
    "weaponCode"    BIGINT,
    "battleType"    TEXT,
    -- CharacterAttributes.mastery → WeaponTypeInfo 인덱스+1 (best_weapon과 동일)
    "masteryWeaponCodes" BIGINT[] NOT NULL DEFAULT '{}'::BIGINT[],
    "sourcePayload" JSONB DEFAULT '{}'::jsonb
);

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

CREATE INDEX IF NOT EXISTS idx_item_type_kind ON item (type, kind);
CREATE INDEX IF NOT EXISTS idx_item_name_kr   ON item (name_kr);
CREATE INDEX IF NOT EXISTS idx_item_name_en   ON item (name_en);

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


-- 전술 스킬 그룹 (ER TacticalSkillSetGroup.group = userGames.tacticalSkillGroup)
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

-- 특성(Characteristic) 코드 마스터 (l10n Trait/Name/{code})
CREATE TABLE IF NOT EXISTS trait (
    code        BIGINT PRIMARY KEY,
    name_kr     TEXT NOT NULL,
    l10n_key    TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE trait IS 'ER Trait 코드별 한국어 표시명 마스터';
COMMENT ON COLUMN trait.code IS 'trait code (예: traitFirstCore, traitFirstSub, traitSecondSub)';
COMMENT ON COLUMN trait.name_kr IS '한국어 이름 (l10n)';
COMMENT ON COLUMN trait.l10n_key IS 'l10n key (Trait/Name/{code})';


-- ============================================================
-- 1. players (플레이어)
-- ============================================================
CREATE TABLE IF NOT EXISTS players (
    "userId"        VARCHAR(200) PRIMARY KEY,
    "userNum"       BIGINT      UNIQUE,
    nickname        VARCHAR(100) NOT NULL,
    "accountLevel"  SMALLINT    DEFAULT 0,
    "rankPoint"     INTEGER     DEFAULT 0,
    "serverName"    VARCHAR(20) DEFAULT 'Asia',
    "lastSyncAt"    TIMESTAMPTZ,
    "createdAt"     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_nickname ON players (nickname);
CREATE INDEX IF NOT EXISTS idx_players_nickname_lower ON players (LOWER(nickname));


-- ============================================================
-- 2. games (게임 세션 메타데이터)
-- ============================================================
CREATE TABLE IF NOT EXISTS games (
    "gameId"                     BIGINT      PRIMARY KEY,
    "seasonId"                   SMALLINT    NOT NULL,
    "matchingMode"               SMALLINT    NOT NULL,   -- 2=일반, 3=랭크
    "matchingTeamMode"           SMALLINT    NOT NULL,   -- 1=솔로, 3=스쿼드
    "serverName"                 VARCHAR(20) DEFAULT 'Asia',
    "versionMajor"               SMALLINT    DEFAULT 0,
    "versionMinor"               SMALLINT    DEFAULT 0,
    "gameVersion"                VARCHAR(20) GENERATED ALWAYS AS
                                ("versionMajor"::TEXT || '.' || "versionMinor"::TEXT) STORED,
    "startDtm"                   TIMESTAMPTZ NOT NULL,
    duration                     INTEGER     DEFAULT 0,  -- 게임 전체 지속 시간(초)
    "matchSize"                  SMALLINT    DEFAULT 24, -- 총 참여 인원
    "botAdded"                   SMALLINT    DEFAULT 0,
    "botRemain"                  SMALLINT    DEFAULT 0,
    "restrictedAreaAccelerated"  SMALLINT    DEFAULT 0,  -- 금지구역 가속 여부
    "safeAreas"                  SMALLINT    DEFAULT 0,  -- 안전 지대 수
    "mmrAvg"                     INTEGER     DEFAULT 0,  -- 매치 평균 MMR
    "createdAt"                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_season        ON games ("seasonId");
CREATE INDEX IF NOT EXISTS idx_games_matching_mode ON games ("matchingMode");
CREATE INDEX IF NOT EXISTS idx_games_start_dtm     ON games ("startDtm" DESC);


-- ============================================================
-- 3. game_details (게임당 플레이어 상세 통계 - 핵심 테이블)
-- ============================================================
CREATE TABLE IF NOT EXISTS game_details (
    id              BIGSERIAL   PRIMARY KEY,
    "gameId"        BIGINT      NOT NULL REFERENCES games("gameId") ON DELETE CASCADE,
    "userId"        VARCHAR(200) NOT NULL REFERENCES players("userId"),
    "userNum"       BIGINT,

    -- ── 캐릭터 ──────────────────────────────────────
    "characterNum"   INTEGER     NOT NULL DEFAULT 0,
    "characterLevel" SMALLINT    DEFAULT 0,
    "skinCode"       INTEGER     DEFAULT 0,

    -- ── 게임 결과 ────────────────────────────────────
    "gameRank"       SMALLINT    DEFAULT 0,
    victory          SMALLINT    DEFAULT 0,  -- 0=패배, 1=승리
    "giveUp"         SMALLINT    DEFAULT 0,  -- 0=정상, 1=포기
    "teamSpectator"  SMALLINT    DEFAULT 0,
    "teamNumber"     SMALLINT    DEFAULT 0,
    "preMade"        SMALLINT    DEFAULT 0,  -- 사전 구성 팀 여부
    "escapeState"    SMALLINT    DEFAULT 0,  -- 탈출 여부

    -- ── 킬 / 어시 / 데스 ─────────────────────────────
    "playerKill"         SMALLINT DEFAULT 0,
    "playerAssistant"    SMALLINT DEFAULT 0,
    "monsterKill"        SMALLINT DEFAULT 0,
    "playerDeaths"       SMALLINT DEFAULT 0,
    "teamKill"           SMALLINT DEFAULT 0,
    "totalFieldKill"     SMALLINT DEFAULT 0,
    "teamElimination"    SMALLINT DEFAULT 0,
    "teamDown"           SMALLINT DEFAULT 0,
    "teamBattleZoneDown" SMALLINT DEFAULT 0,
    "teamRepeatDown"     SMALLINT DEFAULT 0,

    -- 멀티킬
    "totalDoubleKill"    SMALLINT DEFAULT 0,
    "totalTripleKill"    SMALLINT DEFAULT 0,
    "totalQuadraKill"    SMALLINT DEFAULT 0,
    "totalExtraKill"     SMALLINT DEFAULT 0,
    "killGamma"          BOOLEAN  DEFAULT FALSE,

    -- 페이즈별 킬/데스
    "killsPhaseOne"     SMALLINT DEFAULT 0,
    "killsPhaseTwo"     SMALLINT DEFAULT 0,
    "killsPhaseThree"   SMALLINT DEFAULT 0,
    "deathsPhaseOne"    SMALLINT DEFAULT 0,
    "deathsPhaseTwo"    SMALLINT DEFAULT 0,
    "deathsPhaseThree"  SMALLINT DEFAULT 0,

    -- ── 무기 ─────────────────────────────────────────
    "bestWeapon"        INTEGER  DEFAULT 0,
    "bestWeaponLevel"   SMALLINT DEFAULT 0,

    -- ── 시간 ─────────────────────────────────────────
    "playTime"          INTEGER  DEFAULT 0,
    "watchTime"         INTEGER  DEFAULT 0,
    "totalTime"         INTEGER  DEFAULT 0,
    "survivableTime"    INTEGER  DEFAULT 0,

    -- ── MMR ──────────────────────────────────────────
    "mmrBefore"         INTEGER  DEFAULT 0,
    "mmrGain"           INTEGER  DEFAULT 0,
    "mmrAfter"          INTEGER  DEFAULT 0,
    "rankPoint"         INTEGER  DEFAULT 0,
    "gainedNormalMmrKFactor" NUMERIC(8,4) DEFAULT 0,

    -- ── 최종 스탯 ────────────────────────────────────
    "maxHp"                      INTEGER  DEFAULT 0,
    "maxSp"                      INTEGER  DEFAULT 0,
    "attackPower"               NUMERIC(8,2) DEFAULT 0,
    defense                     NUMERIC(8,2) DEFAULT 0,
    "hpRegen"                   NUMERIC(8,4) DEFAULT 0,
    "spRegen"                   NUMERIC(8,4) DEFAULT 0,
    "attackSpeed"               NUMERIC(6,4) DEFAULT 0,
    "moveSpeed"                 NUMERIC(6,4) DEFAULT 0,
    "outOfCombatMoveSpeed"     NUMERIC(6,4) DEFAULT 0,
    "sightRange"                NUMERIC(6,2) DEFAULT 0,
    "attackRange"               NUMERIC(6,2) DEFAULT 0,
    "criticalStrikeChance"      NUMERIC(6,4) DEFAULT 0,
    "criticalStrikeDamage"      NUMERIC(6,4) DEFAULT 0,
    "coolDownReduction"         NUMERIC(6,4) DEFAULT 0,
    "lifeSteal"                 NUMERIC(6,4) DEFAULT 0,
    "normalLifeSteal"           NUMERIC(6,4) DEFAULT 0,
    "skillLifeSteal"            NUMERIC(6,4) DEFAULT 0,
    "amplifierToMonster"        NUMERIC(8,2) DEFAULT 0,
    "trapDamage"                NUMERIC(8,2) DEFAULT 0,
    "adaptiveForce"             NUMERIC(8,2) DEFAULT 0,
    "adaptiveForceAttack"       NUMERIC(8,2) DEFAULT 0,
    "adaptiveForceAmplify"      NUMERIC(8,2) DEFAULT 0,
    "skillAmp"                  NUMERIC(8,2) DEFAULT 0,

    -- ── 플레이어 대상 데미지 (API 필드명과 동일) ─────
    "damageToPlayer"            INTEGER  DEFAULT 0,
    "damageToPlayer_trap"       INTEGER  DEFAULT 0,
    "damageToPlayer_basic"      INTEGER  DEFAULT 0,
    "damageToPlayer_skill"      INTEGER  DEFAULT 0,
    "damageToPlayer_itemSkill"  INTEGER  DEFAULT 0,
    "damageToPlayer_direct"     INTEGER  DEFAULT 0,
    "damageToPlayer_uniqueSkill" INTEGER DEFAULT 0,
    "damageToPlayer_Shield"     INTEGER  DEFAULT 0,

    -- ── 플레이어에게 받은 데미지 ──────────────────────
    "damageFromPlayer"              INTEGER  DEFAULT 0,
    "damageFromPlayer_trap"         INTEGER  DEFAULT 0,
    "damageFromPlayer_basic"        INTEGER  DEFAULT 0,
    "damageFromPlayer_skill"        INTEGER  DEFAULT 0,
    "damageFromPlayer_itemSkill"    INTEGER  DEFAULT 0,
    "damageFromPlayer_direct"       INTEGER  DEFAULT 0,
    "damageFromPlayer_uniqueSkill" INTEGER  DEFAULT 0,

    -- ── 몬스터 대상 데미지 ────────────────────────────
    "damageToMonster"               INTEGER  DEFAULT 0,
    "damageToMonster_trap"          INTEGER  DEFAULT 0,
    "damageToMonster_basic"         INTEGER  DEFAULT 0,
    "damageToMonster_skill"         INTEGER  DEFAULT 0,
    "damageToMonster_itemSkill"    INTEGER  DEFAULT 0,
    "damageToMonster_direct"        INTEGER  DEFAULT 0,
    "damageToMonster_uniqueSkill"  INTEGER  DEFAULT 0,

    -- ── 몬스터에게 받은 데미지 / 실드 ───────────────────
    "damageFromMonster"                 INTEGER  DEFAULT 0,
    "damageOffsetedByShield_Player"   INTEGER  DEFAULT 0,
    "damageOffsetedByShield_Monster"   INTEGER  DEFAULT 0,

    -- ── 회복 / 보호막 / CC ────────────────────────────
    "healAmount"        INTEGER      DEFAULT 0,
    "teamRecover"       INTEGER      DEFAULT 0,
    "protectAbsorb"     INTEGER      DEFAULT 0,
    "ccTimeToPlayer"    NUMERIC(10,4) DEFAULT 0,

    -- ── 제작 ─────────────────────────────────────────
    "craftUncommon"     SMALLINT DEFAULT 0,
    "craftRare"         SMALLINT DEFAULT 0,
    "craftEpic"         SMALLINT DEFAULT 0,
    "craftLegend"       SMALLINT DEFAULT 0,
    "craftMythic"       SMALLINT DEFAULT 0,

    -- ── 경험치 ───────────────────────────────────────
    "gainExp"           INTEGER  DEFAULT 0,
    "baseExp"           INTEGER  DEFAULT 0,
    "bonusExp"          INTEGER  DEFAULT 0,
    "bonusCoin"         INTEGER  DEFAULT 0,

    -- ── 오브젝트 / 맵 상호작용 ─────────────────────────
    "addSurveillanceCamera"     SMALLINT DEFAULT 0,
    "addTelephotoCamera"        SMALLINT DEFAULT 0,
    "removeSurveillanceCamera"  SMALLINT DEFAULT 0,
    "removeTelephotoCamera"     SMALLINT DEFAULT 0,
    "useHyperLoop"              SMALLINT DEFAULT 0,
    "useSecurityConsole"        SMALLINT DEFAULT 0,
    "usedPairLoop"              SMALLINT DEFAULT 0,
    "totalTurbineTakeOver"      SMALLINT DEFAULT 0,
    "fishingCount"              SMALLINT DEFAULT 0,
    "useEmoticonCount"          SMALLINT DEFAULT 0,

    -- ── 전술 스킬 ─────────────────────────────────────
    "tacticalSkillGroup"        INTEGER  DEFAULT 0,
    "tacticalSkillLevel"        SMALLINT DEFAULT 0,

    -- ── 치료팩 / 실드팩 ──────────────────────────────
    "usedNormalHealPack"       SMALLINT DEFAULT 0,
    "usedReinforcedHealPack"   SMALLINT DEFAULT 0,
    "usedNormalShieldPack"     SMALLINT DEFAULT 0,
    "usedReinforceShieldPack" SMALLINT DEFAULT 0,

    -- ── 루트 ─────────────────────────────────────────
    "routeIdOfStart"   INTEGER      DEFAULT 0,
    "routeSlotId"      SMALLINT     DEFAULT 0,
    "placeOfStart"     VARCHAR(10)  DEFAULT '',

    -- ── 배틀존 요약 ───────────────────────────────────
    "battleZonePlayerKill"     SMALLINT DEFAULT 0,
    "battleZoneDeaths"         SMALLINT DEFAULT 0,

    -- ── VF 크레딧 요약 ────────────────────────────────
    "totalGainVFCredit"                    INTEGER  DEFAULT 0,
    "totalUseVFCredit"                     INTEGER  DEFAULT 0,
    "sumUsedVFCredits"                     INTEGER  DEFAULT 0,
    "activelyGainedCredits"                 INTEGER  DEFAULT 0,
    "killPlayerGainVFCredit"               INTEGER  DEFAULT 0,
    "killChickenGainVFCredit"             INTEGER  DEFAULT 0,
    "killBoarGainVFCredit"                INTEGER  DEFAULT 0,
    "killWildDogGainVFCredit"            INTEGER  DEFAULT 0,
    "killWolfGainVFCredit"                INTEGER  DEFAULT 0,
    "killBearGainVFCredit"                INTEGER  DEFAULT 0,
    "killOmegaGainVFCredit"               INTEGER  DEFAULT 0,
    "killBatGainVFCredit"                 INTEGER  DEFAULT 0,
    "killWicklineGainVFCredit"            INTEGER  DEFAULT 0,
    "killAlphaGainVFCredit"               INTEGER  DEFAULT 0,
    "killItemBountyGainVFCredit"         INTEGER  DEFAULT 0,
    "killDroneGainVFCredit"               INTEGER  DEFAULT 0,
    "killGammaGainVFCredit"               INTEGER  DEFAULT 0,
    "killTurretGainVFCredit"              INTEGER  DEFAULT 0,
    "itemShredderGainVFCredit"            INTEGER  DEFAULT 0,
    "remoteDroneUseVFCreditMySelf"        INTEGER  DEFAULT 0,
    "remoteDroneUseVFCreditAlly"         INTEGER  DEFAULT 0,
    "transferConsoleFromMaterialUseVFCredit"    INTEGER DEFAULT 0,
    "transferConsoleFromEscapeKeyUseVFCredit"  INTEGER DEFAULT 0,
    "transferConsoleFromRevivalUseVFCredit"     INTEGER DEFAULT 0,
    "tacticalSkillUpgradeUseVFCredit"    INTEGER  DEFAULT 0,
    "infusionReRollUseVFCredit"           INTEGER  DEFAULT 0,
    "infusionTraitUseVFCredit"            INTEGER  DEFAULT 0,
    "infusionRelicUseVFCredit"            INTEGER  DEFAULT 0,
    "infusionStoreUseVFCredit"            INTEGER  DEFAULT 0,

    -- ── 서버 / 언어 ──────────────────────────────────
    "serverName"         VARCHAR(20)  DEFAULT 'Asia',
    language             VARCHAR(20)  DEFAULT 'Korean',

    -- ── 만료 일시 ─────────────────────────────────────
    "expireDtm"          TIMESTAMPTZ,

    -- ── JSONB 필드 ───────────────────────────────────
    equipment            JSONB        DEFAULT '{}',
    "equipmentGrade"     JSONB        DEFAULT '{}',
    "masteryLevel"       JSONB        DEFAULT '{}',
    "skillLevelInfo"     JSONB        DEFAULT '{}',
    "skillOrderInfo"     JSONB        DEFAULT '{}',
    "killMonsters"       JSONB        DEFAULT '{}',
    "traitFirstCore"     INTEGER      DEFAULT 0,
    "traitFirstSub"      JSONB        DEFAULT '[]',
    "traitSecondSub"     JSONB        DEFAULT '[]',
    "airSupplyOpenCount" JSONB        DEFAULT '[]',
    "foodCraftCount"     JSONB        DEFAULT '[]',
    "beverageCraftCount" JSONB       DEFAULT '[]',
    "totalVFCredits"     JSONB        DEFAULT '[]',
    "usedVFCredits"      JSONB        DEFAULT '[]',
    "scoredPoint"        JSONB        DEFAULT '[]',
    "creditSource"       JSONB        DEFAULT '{}',
    "eventMissionResult" JSONB       DEFAULT '{}',
    "itemTransferredConsole"    JSONB DEFAULT '[]',
    "itemTransferredDrone"      JSONB DEFAULT '[]',
    "collectItemForLog"        JSONB DEFAULT '[]',
    "equipFirstItemForLog"    JSONB DEFAULT '{}',
    "boughtInfusion"             JSONB DEFAULT '{}',
    "killDetails"        TEXT         DEFAULT '{}',
    "deathDetails"       TEXT         DEFAULT '{}',

    CONSTRAINT uq_game_user UNIQUE ("gameId", "userId")
);

CREATE INDEX IF NOT EXISTS idx_gd_game_id       ON game_details ("gameId");
CREATE INDEX IF NOT EXISTS idx_gd_user_id       ON game_details ("userId");
CREATE INDEX IF NOT EXISTS idx_gd_user_num      ON game_details ("userNum");
CREATE INDEX IF NOT EXISTS idx_gd_character     ON game_details ("characterNum");
CREATE INDEX IF NOT EXISTS idx_gd_game_rank     ON game_details ("gameRank");
CREATE INDEX IF NOT EXISTS idx_gd_victory       ON game_details (victory);
CREATE INDEX IF NOT EXISTS idx_gd_user_game     ON game_details ("userId", "gameId");

CREATE INDEX IF NOT EXISTS idx_gd_equipment_gin     ON game_details USING GIN (equipment);
CREATE INDEX IF NOT EXISTS idx_gd_mastery_gin       ON game_details USING GIN ("masteryLevel");
CREATE INDEX IF NOT EXISTS idx_gd_kill_monsters_gin ON game_details USING GIN ("killMonsters");


-- ============================================================
-- 4. game_detail_killers
-- ============================================================
CREATE TABLE IF NOT EXISTS game_detail_killers (
    id                  BIGSERIAL   PRIMARY KEY,
    "gameDetailId"      BIGINT      NOT NULL REFERENCES game_details(id) ON DELETE CASCADE,
    "killerOrder"       SMALLINT    NOT NULL,
    "killerUserNum"     BIGINT      DEFAULT 0,
    "killerType"        VARCHAR(20) DEFAULT '',
    "killDetail"        VARCHAR(100) DEFAULT '',
    "causeOfDeath"      VARCHAR(200) DEFAULT '',
    "placeOfDeath"      VARCHAR(10)  DEFAULT '',
    "killerCharacter"   VARCHAR(50)  DEFAULT '',
    "killerWeapon"      VARCHAR(50)  DEFAULT '',

    CONSTRAINT uq_killer_order UNIQUE ("gameDetailId", "killerOrder")
);

CREATE INDEX IF NOT EXISTS idx_killers_game_detail ON game_detail_killers ("gameDetailId");
CREATE INDEX IF NOT EXISTS idx_killers_user_num    ON game_detail_killers ("killerUserNum");


-- ============================================================
-- 5. game_detail_battle_zones
-- ============================================================
CREATE TABLE IF NOT EXISTS game_detail_battle_zones (
    id                  BIGSERIAL   PRIMARY KEY,
    "gameDetailId"      BIGINT      NOT NULL REFERENCES game_details(id) ON DELETE CASCADE,
    "zoneNumber"        SMALLINT    NOT NULL,
    "areaCode"          INTEGER     DEFAULT 0,
    "battleMark"        INTEGER     DEFAULT 0,
    "battleMarkCount"   INTEGER     DEFAULT 0,
    winner              SMALLINT    DEFAULT 0,
    "itemCodes"         JSONB       DEFAULT '[]',

    CONSTRAINT uq_battle_zone UNIQUE ("gameDetailId", "zoneNumber")
);

CREATE INDEX IF NOT EXISTS idx_battle_zones_game_detail ON game_detail_battle_zones ("gameDetailId");


-- ============================================================
-- 6. octagon_scores
-- ============================================================
CREATE TABLE IF NOT EXISTS octagon_scores (
    id              BIGSERIAL   PRIMARY KEY,
    "userId"        VARCHAR(200) NOT NULL REFERENCES players("userId") ON DELETE CASCADE,
    "userNum"       BIGINT,
    "seasonId"      SMALLINT    NOT NULL,
    "matchingMode"  SMALLINT    NOT NULL,

    "combatScore"    NUMERIC(6,3) DEFAULT 0.0,
    "takedownScore"  NUMERIC(6,3) DEFAULT 0.0,
    "huntingScore"   NUMERIC(6,3) DEFAULT 0.0,
    "visionScore"    NUMERIC(6,3) DEFAULT 0.0,
    "masteryScore"   NUMERIC(6,3) DEFAULT 0.0,
    "survivalScore"  NUMERIC(6,3) DEFAULT 0.0,
    "craftScore"     NUMERIC(6,3) DEFAULT 0.0,
    "supportScore"   NUMERIC(6,3) DEFAULT 0.0,

    "centerGrade"    VARCHAR(5)   DEFAULT 'C',
    "gamesAnalyzed"  INTEGER      DEFAULT 0,
    "calculatedAt"   TIMESTAMPTZ  DEFAULT NOW(),

    CONSTRAINT uq_octagon UNIQUE ("userId", "seasonId", "matchingMode")
);

CREATE INDEX IF NOT EXISTS idx_octagon_user ON octagon_scores ("userId");


-- ============================================================
-- 7. character_stats_cache
-- ============================================================
CREATE TABLE IF NOT EXISTS character_stats_cache (
    id                  BIGSERIAL   PRIMARY KEY,
    "seasonId"          SMALLINT    NOT NULL,
    "matchingMode"      SMALLINT    NOT NULL,
    "matchingTeamMode" SMALLINT NOT NULL,
    "characterNum"      INTEGER     NOT NULL,

    "totalGames"     INTEGER     DEFAULT 0,
    "totalWins"      INTEGER     DEFAULT 0,
    "winRate"        NUMERIC(5,2) DEFAULT 0.0,
    "avgRank"        NUMERIC(5,2) DEFAULT 0.0,
    "avgKill"        NUMERIC(5,2) DEFAULT 0.0,
    "avgAssist"      NUMERIC(5,2) DEFAULT 0.0,
    "avgDeath"       NUMERIC(5,2) DEFAULT 0.0,
    "avgDamage"      NUMERIC(10,2) DEFAULT 0.0,
    "pickRate"       NUMERIC(5,2) DEFAULT 0.0,

    "calculatedAt"   TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_char_stats UNIQUE ("seasonId", "matchingMode", "matchingTeamMode", "characterNum")
);

CREATE INDEX IF NOT EXISTS idx_char_stats_season ON character_stats_cache ("seasonId", "matchingMode");


-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW v_player_game_history AS
SELECT
    gd.id,
    gd."userId",
    gd."userNum",
    p.nickname,
    gd."gameId",
    g."seasonId",
    g."matchingMode",
    g."matchingTeamMode",
    g."startDtm",
    g.duration,
    gd."characterNum",
    gd."characterLevel",
    gd."skinCode",
    gd."gameRank",
    gd.victory,
    gd."playerKill",
    gd."playerAssistant",
    gd."playerDeaths",
    gd."teamKill",
    gd."damageToPlayer",
    gd."healAmount",
    gd."mmrBefore",
    gd."mmrGain",
    gd."mmrAfter",
    gd."rankPoint",
    gd."bestWeapon",
    gd."bestWeaponLevel",
    gd."playTime",
    gd.equipment,
    gd."equipmentGrade",
    gd."masteryLevel",
    gd."traitFirstCore",
    gd."traitFirstSub",
    gd."traitSecondSub",
    gd."tacticalSkillGroup",
    gd."tacticalSkillLevel",
    gd."craftUncommon",
    gd."craftRare",
    gd."craftEpic",
    gd."craftLegend",
    gd."craftMythic"
FROM game_details gd
JOIN games g ON g."gameId" = gd."gameId"
JOIN players p ON p."userId" = gd."userId";


CREATE OR REPLACE VIEW v_game_participants AS
SELECT
    gd."gameId",
    g."seasonId",
    g."matchingMode",
    g."matchingTeamMode",
    g."startDtm",
    gd."teamNumber",
    gd."userId",
    gd."userNum",
    p.nickname,
    gd."characterNum",
    gd."gameRank",
    gd.victory,
    gd."playerKill",
    gd."playerAssistant",
    gd."playerDeaths",
    gd."damageToPlayer",
    gd."bestWeapon"
FROM game_details gd
JOIN games g ON g."gameId" = gd."gameId"
JOIN players p ON p."userId" = gd."userId"
ORDER BY gd."gameId", gd."gameRank";


-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE players           IS '플레이어 기본 정보';
COMMENT ON TABLE games             IS '게임 세션 메타데이터';
COMMENT ON TABLE game_details      IS '게임당 플레이어 상세 통계 (핵심 테이블)';
COMMENT ON TABLE game_detail_killers   IS '게임 킬러 정보 (최대 3명)';
COMMENT ON TABLE game_detail_battle_zones IS '배틀존 정보 (최대 3개 구역)';
COMMENT ON TABLE octagon_scores    IS '옥타곤 지표 - 플레이어 종합 평가 점수';
COMMENT ON TABLE character_stats_cache IS '캐릭터별 집계 통계 캐시';

COMMENT ON COLUMN games."matchingMode"    IS '2=일반, 3=랭크';
COMMENT ON COLUMN games."matchingTeamMode" IS '1=솔로, 3=스쿼드';
COMMENT ON COLUMN game_details.equipment        IS 'JSONB: {slot: item_code} - 착용 장비';
COMMENT ON COLUMN game_details."equipmentGrade"  IS 'JSONB: {slot: grade} - 착용 장비 등급';
COMMENT ON COLUMN game_details."masteryLevel"    IS 'JSONB: {weapon_type: level} - 마스터리 레벨';
COMMENT ON COLUMN game_details."skillLevelInfo" IS 'JSONB: {skill_code: level} - 스킬 레벨';
COMMENT ON COLUMN game_details."skillOrderInfo" IS 'JSONB: {order: skill_code} - 스킬 습득 순서';
COMMENT ON COLUMN game_details."killMonsters"    IS 'JSONB: {monster_type: count} - 잡은 몬스터';
COMMENT ON COLUMN game_details."traitFirstSub"  IS 'JSONB array: [trait_code, ...] - 서브 특성 1';
COMMENT ON COLUMN game_details."traitSecondSub" IS 'JSONB array: [trait_code, ...] - 서브 특성 2';
COMMENT ON COLUMN game_details."totalVFCredits" IS 'JSONB array: [0..19] - 시간대별 획득 크레딧';
COMMENT ON COLUMN game_details."usedVFCredits"  IS 'JSONB array: [0..19] - 시간대별 사용 크레딧';
COMMENT ON COLUMN game_details."scoredPoint"     IS 'JSONB array: [0..19] - 시간대별 획득 점수';
COMMENT ON COLUMN game_detail_killers."killerOrder" IS '1=첫 번째 킬러, 2=두 번째, 3=세 번째';
