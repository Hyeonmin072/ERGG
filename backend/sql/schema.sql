-- ============================================================
-- Eternal Return 전적 검색 서비스 - PostgreSQL 스키마
-- Database: ergg_db
-- ============================================================


-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE matching_mode_type AS ENUM ('2', '3');          -- 2=일반, 3=랭크
CREATE TYPE matching_team_mode_type AS ENUM ('1', '2', '3'); -- 1=솔로, 3=스쿼드 (ER 본가; 2는 API/레거시 값 가능)


-- ============================================================
-- 1. players (플레이어)
-- ============================================================
CREATE TABLE IF NOT EXISTS players (
    user_id         VARCHAR(200) PRIMARY KEY,
    user_num        BIGINT      UNIQUE,
    nickname        VARCHAR(100) NOT NULL,
    account_level   SMALLINT    DEFAULT 0,
    rank_point      INTEGER     DEFAULT 0,
    server_name     VARCHAR(20) DEFAULT 'Asia',
    last_sync_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_nickname ON players (nickname);
CREATE INDEX IF NOT EXISTS idx_players_nickname_lower ON players (LOWER(nickname));


-- ============================================================
-- 2. games (게임 세션 메타데이터)
-- ============================================================
CREATE TABLE IF NOT EXISTS games (
    game_id                     BIGINT      PRIMARY KEY,
    season_id                   SMALLINT    NOT NULL,
    matching_mode               SMALLINT    NOT NULL,   -- 2=일반, 3=랭크
    matching_team_mode          SMALLINT    NOT NULL,   -- 1=솔로, 3=스쿼드
    server_name                 VARCHAR(20) DEFAULT 'Asia',
    version_major               SMALLINT    DEFAULT 0,
    version_minor               SMALLINT    DEFAULT 0,
    game_version                VARCHAR(20) GENERATED ALWAYS AS
                                (version_major::TEXT || '.' || version_minor::TEXT) STORED,
    start_dtm                   TIMESTAMPTZ NOT NULL,
    duration                    INTEGER     DEFAULT 0,  -- 게임 전체 지속 시간(초)
    match_size                  SMALLINT    DEFAULT 24, -- 총 참여 인원
    bot_added                   SMALLINT    DEFAULT 0,
    bot_remain                  SMALLINT    DEFAULT 0,
    restricted_area_accelerated SMALLINT    DEFAULT 0,  -- 금지구역 가속 여부
    safe_areas                  SMALLINT    DEFAULT 0,  -- 안전 지대 수
    mmr_avg                     INTEGER     DEFAULT 0,  -- 매치 평균 MMR
    created_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_season        ON games (season_id);
CREATE INDEX IF NOT EXISTS idx_games_matching_mode ON games (matching_mode);
CREATE INDEX IF NOT EXISTS idx_games_start_dtm     ON games (start_dtm DESC);


-- ============================================================
-- 3. game_details (게임당 플레이어 상세 통계 - 핵심 테이블)
-- ============================================================
CREATE TABLE IF NOT EXISTS game_details (
    id              BIGSERIAL   PRIMARY KEY,
    game_id         BIGINT      NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
    user_id         VARCHAR(200) NOT NULL REFERENCES players(user_id),
    user_num        BIGINT,

    -- ── 캐릭터 ──────────────────────────────────────
    character_num   INTEGER     NOT NULL DEFAULT 0,
    character_level SMALLINT    DEFAULT 0,
    skin_code       INTEGER     DEFAULT 0,

    -- ── 게임 결과 ────────────────────────────────────
    game_rank       SMALLINT    DEFAULT 0,
    victory         SMALLINT    DEFAULT 0,  -- 0=패배, 1=승리
    give_up         SMALLINT    DEFAULT 0,  -- 0=정상, 1=포기
    team_spectator  SMALLINT    DEFAULT 0,
    team_number     SMALLINT    DEFAULT 0,
    pre_made        SMALLINT    DEFAULT 0,  -- 사전 구성 팀 여부
    escape_state    SMALLINT    DEFAULT 0,  -- 탈출 여부

    -- ── 킬 / 어시 / 데스 ─────────────────────────────
    player_kill         SMALLINT DEFAULT 0,
    player_assistant    SMALLINT DEFAULT 0,
    monster_kill        SMALLINT DEFAULT 0,
    player_deaths       SMALLINT DEFAULT 0,
    team_kill           SMALLINT DEFAULT 0,
    total_field_kill    SMALLINT DEFAULT 0,
    team_elimination    SMALLINT DEFAULT 0,
    team_down           SMALLINT DEFAULT 0,
    team_battle_zone_down   SMALLINT DEFAULT 0,
    team_repeat_down    SMALLINT DEFAULT 0,

    -- 멀티킬
    total_double_kill   SMALLINT DEFAULT 0,
    total_triple_kill   SMALLINT DEFAULT 0,
    total_quadra_kill   SMALLINT DEFAULT 0,
    total_extra_kill    SMALLINT DEFAULT 0,
    kill_gamma          BOOLEAN  DEFAULT FALSE,

    -- 페이즈별 킬/데스
    kills_phase_one     SMALLINT DEFAULT 0,
    kills_phase_two     SMALLINT DEFAULT 0,
    kills_phase_three   SMALLINT DEFAULT 0,
    deaths_phase_one    SMALLINT DEFAULT 0,
    deaths_phase_two    SMALLINT DEFAULT 0,
    deaths_phase_three  SMALLINT DEFAULT 0,

    -- ── 무기 ─────────────────────────────────────────
    best_weapon         INTEGER  DEFAULT 0,  -- 최고 레벨 무기 번호
    best_weapon_level   SMALLINT DEFAULT 0,

    -- ── 시간 ─────────────────────────────────────────
    play_time           INTEGER  DEFAULT 0,  -- 플레이 시간(초)
    watch_time          INTEGER  DEFAULT 0,  -- 관전 시간(초)
    total_time          INTEGER  DEFAULT 0,  -- 총 시간(초)
    survivable_time     INTEGER  DEFAULT 0,  -- 생존 가능 시간(초)

    -- ── MMR ──────────────────────────────────────────
    mmr_before          INTEGER  DEFAULT 0,
    mmr_gain            INTEGER  DEFAULT 0,
    mmr_after           INTEGER  DEFAULT 0,
    rank_point          INTEGER  DEFAULT 0,
    gained_normal_mmr_k_factor NUMERIC(8,4) DEFAULT 0,

    -- ── 최종 스탯 ────────────────────────────────────
    max_hp                      INTEGER  DEFAULT 0,
    max_sp                      INTEGER  DEFAULT 0,
    attack_power                NUMERIC(8,2) DEFAULT 0,
    defense                     NUMERIC(8,2) DEFAULT 0,
    hp_regen                    NUMERIC(8,4) DEFAULT 0,
    sp_regen                    NUMERIC(8,4) DEFAULT 0,
    attack_speed                NUMERIC(6,4) DEFAULT 0,
    move_speed                  NUMERIC(6,4) DEFAULT 0,
    out_of_combat_move_speed    NUMERIC(6,4) DEFAULT 0,
    sight_range                 NUMERIC(6,2) DEFAULT 0,
    attack_range                NUMERIC(6,2) DEFAULT 0,
    critical_strike_chance      NUMERIC(6,4) DEFAULT 0,
    critical_strike_damage      NUMERIC(6,4) DEFAULT 0,
    cool_down_reduction         NUMERIC(6,4) DEFAULT 0,
    life_steal                  NUMERIC(6,4) DEFAULT 0,
    normal_life_steal           NUMERIC(6,4) DEFAULT 0,
    skill_life_steal            NUMERIC(6,4) DEFAULT 0,
    amplifier_to_monster        NUMERIC(8,2) DEFAULT 0,
    trap_damage                 NUMERIC(8,2) DEFAULT 0,
    adaptive_force              NUMERIC(8,2) DEFAULT 0,
    adaptive_force_attack       NUMERIC(8,2) DEFAULT 0,
    adaptive_force_amplify      NUMERIC(8,2) DEFAULT 0,
    skill_amp                   NUMERIC(8,2) DEFAULT 0,

    -- ── 플레이어 대상 데미지 ──────────────────────────
    damage_to_player            INTEGER  DEFAULT 0,
    damage_to_player_trap       INTEGER  DEFAULT 0,
    damage_to_player_basic      INTEGER  DEFAULT 0,
    damage_to_player_skill      INTEGER  DEFAULT 0,
    damage_to_player_item_skill INTEGER  DEFAULT 0,
    damage_to_player_direct     INTEGER  DEFAULT 0,
    damage_to_player_unique_skill   INTEGER DEFAULT 0,
    damage_to_player_shield     INTEGER  DEFAULT 0,

    -- ── 플레이어에게 받은 데미지 ──────────────────────
    damage_from_player              INTEGER  DEFAULT 0,
    damage_from_player_trap         INTEGER  DEFAULT 0,
    damage_from_player_basic        INTEGER  DEFAULT 0,
    damage_from_player_skill        INTEGER  DEFAULT 0,
    damage_from_player_item_skill   INTEGER  DEFAULT 0,
    damage_from_player_direct       INTEGER  DEFAULT 0,
    damage_from_player_unique_skill INTEGER  DEFAULT 0,

    -- ── 몬스터 대상 데미지 ────────────────────────────
    damage_to_monster               INTEGER  DEFAULT 0,
    damage_to_monster_trap          INTEGER  DEFAULT 0,
    damage_to_monster_basic         INTEGER  DEFAULT 0,
    damage_to_monster_skill         INTEGER  DEFAULT 0,
    damage_to_monster_item_skill    INTEGER  DEFAULT 0,
    damage_to_monster_direct        INTEGER  DEFAULT 0,
    damage_to_monster_unique_skill  INTEGER  DEFAULT 0,

    -- ── 몬스터에게 받은 데미지 / 실드 ───────────────────
    damage_from_monster                 INTEGER  DEFAULT 0,
    damage_offset_by_shield_player      INTEGER  DEFAULT 0,
    damage_offset_by_shield_monster     INTEGER  DEFAULT 0,

    -- ── 회복 / 보호막 / CC ────────────────────────────
    heal_amount         INTEGER      DEFAULT 0,
    team_recover        INTEGER      DEFAULT 0,
    protect_absorb      INTEGER      DEFAULT 0,
    cc_time_to_player   NUMERIC(10,4) DEFAULT 0,

    -- ── 제작 ─────────────────────────────────────────
    craft_uncommon      SMALLINT DEFAULT 0,  -- 언커먼
    craft_rare          SMALLINT DEFAULT 0,  -- 레어
    craft_epic          SMALLINT DEFAULT 0,  -- 에픽
    craft_legend        SMALLINT DEFAULT 0,  -- 레전드
    craft_mythic        SMALLINT DEFAULT 0,  -- 미식

    -- ── 경험치 ───────────────────────────────────────
    gain_exp            INTEGER  DEFAULT 0,
    base_exp            INTEGER  DEFAULT 0,
    bonus_exp           INTEGER  DEFAULT 0,
    bonus_coin          INTEGER  DEFAULT 0,

    -- ── 오브젝트 / 맵 상호작용 ─────────────────────────
    add_surveillance_camera     SMALLINT DEFAULT 0,
    add_telephoto_camera        SMALLINT DEFAULT 0,
    remove_surveillance_camera  SMALLINT DEFAULT 0,
    remove_telephoto_camera     SMALLINT DEFAULT 0,
    use_hyper_loop              SMALLINT DEFAULT 0,  -- 하이퍼루프 사용 횟수
    use_security_console        SMALLINT DEFAULT 0,  -- 보안 콘솔 사용 횟수
    used_pair_loop              SMALLINT DEFAULT 0,  -- 페어 루프 사용 횟수
    total_turbine_take_over     SMALLINT DEFAULT 0,  -- 터빈 점령 수
    fishing_count               SMALLINT DEFAULT 0,
    use_emoticon_count          SMALLINT DEFAULT 0,

    -- ── 전술 스킬 ─────────────────────────────────────
    tactical_skill_group        INTEGER  DEFAULT 0,
    tactical_skill_level        SMALLINT DEFAULT 0,

    -- ── 치료팩 / 실드팩 ──────────────────────────────
    used_normal_heal_pack       SMALLINT DEFAULT 0,
    used_reinforced_heal_pack   SMALLINT DEFAULT 0,
    used_normal_shield_pack     SMALLINT DEFAULT 0,
    used_reinforce_shield_pack  SMALLINT DEFAULT 0,

    -- ── 루트 ─────────────────────────────────────────
    route_id_of_start   INTEGER      DEFAULT 0,
    route_slot_id       SMALLINT     DEFAULT 0,
    place_of_start      VARCHAR(10)  DEFAULT '',

    -- ── 배틀존 요약 ───────────────────────────────────
    battle_zone_player_kill     SMALLINT DEFAULT 0,
    battle_zone_deaths          SMALLINT DEFAULT 0,

    -- ── VF 크레딧 요약 ────────────────────────────────
    total_gain_vf_credit                    INTEGER  DEFAULT 0,
    total_use_vf_credit                     INTEGER  DEFAULT 0,
    sum_used_vf_credits                     INTEGER  DEFAULT 0,
    actively_gained_credits                 INTEGER  DEFAULT 0,
    -- 크레딧 획득 원천별
    kill_player_gain_vf_credit              INTEGER  DEFAULT 0,
    kill_chicken_gain_vf_credit             INTEGER  DEFAULT 0,
    kill_boar_gain_vf_credit                INTEGER  DEFAULT 0,
    kill_wild_dog_gain_vf_credit            INTEGER  DEFAULT 0,
    kill_wolf_gain_vf_credit                INTEGER  DEFAULT 0,
    kill_bear_gain_vf_credit                INTEGER  DEFAULT 0,
    kill_omega_gain_vf_credit               INTEGER  DEFAULT 0,
    kill_bat_gain_vf_credit                 INTEGER  DEFAULT 0,
    kill_wickline_gain_vf_credit            INTEGER  DEFAULT 0,
    kill_alpha_gain_vf_credit               INTEGER  DEFAULT 0,
    kill_item_bounty_gain_vf_credit         INTEGER  DEFAULT 0,
    kill_drone_gain_vf_credit               INTEGER  DEFAULT 0,
    kill_gamma_gain_vf_credit               INTEGER  DEFAULT 0,
    kill_turret_gain_vf_credit              INTEGER  DEFAULT 0,
    item_shredder_gain_vf_credit            INTEGER  DEFAULT 0,
    -- VF 크레딧 사용 원천별
    remote_drone_use_vf_credit_myself       INTEGER  DEFAULT 0,
    remote_drone_use_vf_credit_ally         INTEGER  DEFAULT 0,
    transfer_console_from_material_use_vf_credit    INTEGER DEFAULT 0,
    transfer_console_from_escape_key_use_vf_credit  INTEGER DEFAULT 0,
    transfer_console_from_revival_use_vf_credit     INTEGER DEFAULT 0,
    tactical_skill_upgrade_use_vf_credit    INTEGER  DEFAULT 0,
    infusion_reroll_use_vf_credit           INTEGER  DEFAULT 0,
    infusion_trait_use_vf_credit            INTEGER  DEFAULT 0,
    infusion_relic_use_vf_credit            INTEGER  DEFAULT 0,
    infusion_store_use_vf_credit            INTEGER  DEFAULT 0,

    -- ── 서버 / 언어 ──────────────────────────────────
    server_name         VARCHAR(20)  DEFAULT 'Asia',
    language            VARCHAR(20)  DEFAULT 'Korean',

    -- ── 만료 일시 ─────────────────────────────────────
    expire_dtm          TIMESTAMPTZ,

    -- ── JSONB 필드 (배열/복합 데이터) ───────────────────
    -- 장비: {"0": 102410, "1": 202420, ...} slot -> item_code
    equipment           JSONB        DEFAULT '{}',
    -- 장비 등급: {"0": 4, "1": 4, ...} slot -> grade
    equipment_grade     JSONB        DEFAULT '{}',
    -- 마스터리 레벨: {"16": 9, "101": 8, ...} weapon_type -> level
    mastery_level       JSONB        DEFAULT '{}',
    -- 스킬 레벨: {"1078100": 2, ...} skill_code -> level
    skill_level_info    JSONB        DEFAULT '{}',
    -- 스킬 습득 순서: {"1": 1078400, ...} order -> skill_code
    skill_order_info    JSONB        DEFAULT '{}',
    -- 잡은 몬스터: {"1": 4, "3": 2, ...} monster_type -> count
    kill_monsters       JSONB        DEFAULT '{}',
    -- 특성
    trait_first_core    INTEGER      DEFAULT 0,
    trait_first_sub     JSONB        DEFAULT '[]',   -- [7010901, 7011201]
    trait_second_sub    JSONB        DEFAULT '[]',   -- [7110101, 7110201]
    -- 공중 보급품 (등급별 7개)
    air_supply_open_count   JSONB    DEFAULT '[]',
    -- 음식/음료 제작 횟수 (등급별 7개)
    food_craft_count    JSONB        DEFAULT '[]',
    beverage_craft_count JSONB       DEFAULT '[]',
    -- 시간대별 VF 크레딧 (20 구간)
    total_vf_credits    JSONB        DEFAULT '[]',
    used_vf_credits     JSONB        DEFAULT '[]',
    -- 시간대별 점수 (20 구간)
    scored_point        JSONB        DEFAULT '[]',
    -- 크레딧 획득 원천 상세 (문자열 키 -> 수량)
    credit_source       JSONB        DEFAULT '{}',
    -- 이벤트 미션 결과
    event_mission_result JSONB       DEFAULT '{}',
    -- 아이템 전송
    item_transferred_console    JSONB DEFAULT '[]',
    item_transferred_drone      JSONB DEFAULT '[]',
    -- 아이템 수집 로그
    collect_item_for_log        JSONB DEFAULT '[]',
    -- 첫 착용 아이템 로그
    equip_first_item_for_log    JSONB DEFAULT '{}',
    -- 구매한 인퓨전
    bought_infusion             JSONB DEFAULT '{}',
    -- 킬/데스 상세 (JSON string 원본)
    kill_details        TEXT         DEFAULT '{}',
    death_details       TEXT         DEFAULT '{}',

    CONSTRAINT uq_game_user UNIQUE (game_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_gd_game_id       ON game_details (game_id);
CREATE INDEX IF NOT EXISTS idx_gd_user_id       ON game_details (user_id);
CREATE INDEX IF NOT EXISTS idx_gd_user_num      ON game_details (user_num);
CREATE INDEX IF NOT EXISTS idx_gd_character     ON game_details (character_num);
CREATE INDEX IF NOT EXISTS idx_gd_game_rank     ON game_details (game_rank);
CREATE INDEX IF NOT EXISTS idx_gd_victory       ON game_details (victory);
CREATE INDEX IF NOT EXISTS idx_gd_user_game     ON game_details (user_id, game_id);

-- JSONB GIN 인덱스 (장비/스킬 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_gd_equipment_gin     ON game_details USING GIN (equipment);
CREATE INDEX IF NOT EXISTS idx_gd_mastery_gin       ON game_details USING GIN (mastery_level);
CREATE INDEX IF NOT EXISTS idx_gd_kill_monsters_gin ON game_details USING GIN (kill_monsters);


-- ============================================================
-- 4. game_detail_killers (킬러 정보 - 최대 3명)
-- ============================================================
CREATE TABLE IF NOT EXISTS game_detail_killers (
    id                  BIGSERIAL   PRIMARY KEY,
    game_detail_id      BIGINT      NOT NULL REFERENCES game_details(id) ON DELETE CASCADE,
    killer_order        SMALLINT    NOT NULL,   -- 1, 2, 3
    killer_user_num     BIGINT      DEFAULT 0,  -- 0이면 봇 또는 환경
    killer_type         VARCHAR(20) DEFAULT '',  -- 'player', 'bot', 'environment' 등
    kill_detail         VARCHAR(100) DEFAULT '', -- 킬러 닉네임 또는 지역명
    cause_of_death      VARCHAR(200) DEFAULT '', -- 사망 원인 (스킬명 등)
    place_of_death      VARCHAR(10)  DEFAULT '', -- 사망 지역 코드
    killer_character    VARCHAR(50)  DEFAULT '', -- 킬러 캐릭터명
    killer_weapon       VARCHAR(50)  DEFAULT '', -- 킬러 무기

    CONSTRAINT uq_killer_order UNIQUE (game_detail_id, killer_order)
);

CREATE INDEX IF NOT EXISTS idx_killers_game_detail ON game_detail_killers (game_detail_id);
CREATE INDEX IF NOT EXISTS idx_killers_user_num    ON game_detail_killers (killer_user_num);


-- ============================================================
-- 5. game_detail_battle_zones (배틀존 정보 - 최대 3개)
-- ============================================================
CREATE TABLE IF NOT EXISTS game_detail_battle_zones (
    id                  BIGSERIAL   PRIMARY KEY,
    game_detail_id      BIGINT      NOT NULL REFERENCES game_details(id) ON DELETE CASCADE,
    zone_number         SMALLINT    NOT NULL,   -- 1, 2, 3
    area_code           INTEGER     DEFAULT 0,
    battle_mark         INTEGER     DEFAULT 0,
    battle_mark_count   INTEGER     DEFAULT 0,
    winner              SMALLINT    DEFAULT 0,
    item_codes          JSONB       DEFAULT '[]',  -- 배틀존 아이템 코드 배열

    CONSTRAINT uq_battle_zone UNIQUE (game_detail_id, zone_number)
);

CREATE INDEX IF NOT EXISTS idx_battle_zones_game_detail ON game_detail_battle_zones (game_detail_id);


-- ============================================================
-- 6. octagon_scores (옥타곤 지표 - 플레이어 종합 점수)
-- ============================================================
CREATE TABLE IF NOT EXISTS octagon_scores (
    id              BIGSERIAL   PRIMARY KEY,
    user_id         VARCHAR(200) NOT NULL REFERENCES players(user_id) ON DELETE CASCADE,
    user_num        BIGINT,
    season_id       SMALLINT    NOT NULL,
    matching_mode   SMALLINT    NOT NULL,

    -- 옥타곤 8개 지표
    combat_score    NUMERIC(6,3) DEFAULT 0.0,   -- 전투
    takedown_score  NUMERIC(6,3) DEFAULT 0.0,   -- 처치
    hunting_score   NUMERIC(6,3) DEFAULT 0.0,   -- 사냥
    vision_score    NUMERIC(6,3) DEFAULT 0.0,   -- 시야
    mastery_score   NUMERIC(6,3) DEFAULT 0.0,   -- 숙련
    survival_score  NUMERIC(6,3) DEFAULT 0.0,   -- 생존
    craft_score     NUMERIC(6,3) DEFAULT 0.0,   -- 제작 (확장용)
    support_score   NUMERIC(6,3) DEFAULT 0.0,   -- 지원 (확장용)

    center_grade    VARCHAR(5)   DEFAULT 'C',   -- 종합 등급 (S+, S, A, B, C, D)
    games_analyzed  INTEGER      DEFAULT 0,     -- 분석에 사용된 게임 수
    calculated_at   TIMESTAMPTZ  DEFAULT NOW(),

    CONSTRAINT uq_octagon UNIQUE (user_id, season_id, matching_mode)
);

CREATE INDEX IF NOT EXISTS idx_octagon_user ON octagon_scores (user_id);


-- ============================================================
-- 7. character_stats_cache (캐릭터별 집계 통계 캐시)
-- ============================================================
CREATE TABLE IF NOT EXISTS character_stats_cache (
    id              BIGSERIAL   PRIMARY KEY,
    season_id       SMALLINT    NOT NULL,
    matching_mode   SMALLINT    NOT NULL,
    matching_team_mode SMALLINT NOT NULL,
    character_num   INTEGER     NOT NULL,

    -- 집계 통계
    total_games     INTEGER     DEFAULT 0,
    total_wins      INTEGER     DEFAULT 0,
    win_rate        NUMERIC(5,2) DEFAULT 0.0,   -- %
    avg_rank        NUMERIC(5,2) DEFAULT 0.0,
    avg_kill        NUMERIC(5,2) DEFAULT 0.0,
    avg_assist      NUMERIC(5,2) DEFAULT 0.0,
    avg_death       NUMERIC(5,2) DEFAULT 0.0,
    avg_damage      NUMERIC(10,2) DEFAULT 0.0,
    pick_rate       NUMERIC(5,2) DEFAULT 0.0,   -- % (전체 게임 대비)

    calculated_at   TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_char_stats UNIQUE (season_id, matching_mode, matching_team_mode, character_num)
);

CREATE INDEX IF NOT EXISTS idx_char_stats_season ON character_stats_cache (season_id, matching_mode);


-- ============================================================
-- VIEWS
-- ============================================================

-- 플레이어 게임 히스토리 뷰 (주요 컬럼만)
CREATE OR REPLACE VIEW v_player_game_history AS
SELECT
    gd.id,
    gd.user_id,
    gd.user_num,
    p.nickname,
    gd.game_id,
    g.season_id,
    g.matching_mode,
    g.matching_team_mode,
    g.start_dtm,
    g.duration,
    gd.character_num,
    gd.character_level,
    gd.skin_code,
    gd.game_rank,
    gd.victory,
    gd.player_kill,
    gd.player_assistant,
    gd.player_deaths,
    gd.team_kill,
    gd.damage_to_player,
    gd.heal_amount,
    gd.mmr_before,
    gd.mmr_gain,
    gd.mmr_after,
    gd.rank_point,
    gd.best_weapon,
    gd.best_weapon_level,
    gd.play_time,
    gd.equipment,
    gd.equipment_grade,
    gd.mastery_level,
    gd.trait_first_core,
    gd.trait_first_sub,
    gd.trait_second_sub,
    gd.tactical_skill_group,
    gd.tactical_skill_level,
    gd.craft_uncommon,
    gd.craft_rare,
    gd.craft_epic,
    gd.craft_legend,
    gd.craft_mythic
FROM game_details gd
JOIN games g ON g.game_id = gd.game_id
JOIN players p ON p.user_id = gd.user_id;


-- 게임 전체 참여자 요약 뷰
CREATE OR REPLACE VIEW v_game_participants AS
SELECT
    gd.game_id,
    g.season_id,
    g.matching_mode,
    g.matching_team_mode,
    g.start_dtm,
    gd.team_number,
    gd.user_id,
    gd.user_num,
    p.nickname,
    gd.character_num,
    gd.game_rank,
    gd.victory,
    gd.player_kill,
    gd.player_assistant,
    gd.player_deaths,
    gd.damage_to_player,
    gd.best_weapon
FROM game_details gd
JOIN games g ON g.game_id = gd.game_id
JOIN players p ON p.user_id = gd.user_id
ORDER BY gd.game_id, gd.game_rank;


-- ============================================================
-- COMMENTS (테이블/컬럼 설명)
-- ============================================================

COMMENT ON TABLE players           IS '플레이어 기본 정보';
COMMENT ON TABLE games             IS '게임 세션 메타데이터';
COMMENT ON TABLE game_details      IS '게임당 플레이어 상세 통계 (핵심 테이블)';
COMMENT ON TABLE game_detail_killers   IS '게임 킬러 정보 (최대 3명)';
COMMENT ON TABLE game_detail_battle_zones IS '배틀존 정보 (최대 3개 구역)';
COMMENT ON TABLE octagon_scores    IS '옥타곤 지표 - 플레이어 종합 평가 점수';
COMMENT ON TABLE character_stats_cache IS '캐릭터별 집계 통계 캐시';

COMMENT ON COLUMN games.matching_mode    IS '2=일반, 3=랭크';
COMMENT ON COLUMN games.matching_team_mode IS '1=솔로, 3=스쿼드';
COMMENT ON COLUMN game_details.equipment        IS 'JSONB: {slot: item_code} - 착용 장비';
COMMENT ON COLUMN game_details.equipment_grade  IS 'JSONB: {slot: grade} - 착용 장비 등급';
COMMENT ON COLUMN game_details.mastery_level    IS 'JSONB: {weapon_type: level} - 마스터리 레벨';
COMMENT ON COLUMN game_details.skill_level_info IS 'JSONB: {skill_code: level} - 스킬 레벨';
COMMENT ON COLUMN game_details.skill_order_info IS 'JSONB: {order: skill_code} - 스킬 습득 순서';
COMMENT ON COLUMN game_details.kill_monsters    IS 'JSONB: {monster_type: count} - 잡은 몬스터';
COMMENT ON COLUMN game_details.trait_first_sub  IS 'JSONB array: [trait_code, ...] - 서브 특성 1';
COMMENT ON COLUMN game_details.trait_second_sub IS 'JSONB array: [trait_code, ...] - 서브 특성 2';
COMMENT ON COLUMN game_details.total_vf_credits IS 'JSONB array: [0..19] - 시간대별 획득 크레딧';
COMMENT ON COLUMN game_details.used_vf_credits  IS 'JSONB array: [0..19] - 시간대별 사용 크레딧';
COMMENT ON COLUMN game_details.scored_point     IS 'JSONB array: [0..19] - 시간대별 획득 점수';
COMMENT ON COLUMN game_detail_killers.killer_order IS '1=첫 번째 킬러, 2=두 번째, 3=세 번째';
