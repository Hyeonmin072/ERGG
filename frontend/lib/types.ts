// ============================================================
// ERGG 프론트엔드 타입 정의
// 백엔드 FastAPI / ER Open API 응답 구조 기반
// ============================================================


// ── ER Open API: 게임 1건 (userGames 배열 원소) ──────────────

export interface KillerInfo {
  killerUserNum: number;
  killer: string;         // 'player' | 'bot' | ...
  killDetail: string;     // 닉네임 or 지역명
  causeOfDeath: string;
  placeOfDeath: string;
  killerCharacter: string;
  killerWeapon: string;
}

export interface BattleZoneInfo {
  areaCode: number;
  battleMark: number;
  battleMarkCount: number;
  winner: number;
  itemCode: number[];
}

export interface UserGame {
  // ── 플레이어 기본 (ER JSON에 없을 수 있음)
  userNum?: number;
  nickname: string;
  gameId: number;
  seasonId: number;
  matchingMode: number;       // 2=일반, 3=랭크
  matchingTeamMode: number;   // 1=솔로, 3=스쿼드 (ER 본가 기준)
  accountLevel: number;
  serverName: string;
  language: string;
  versionMajor: number;
  versionMinor: number;

  // ── 캐릭터
  characterNum: number;
  skinCode: number;
  characterLevel: number;

  // ── 게임 결과
  gameRank: number;
  victory: number;          // 0 | 1
  giveUp: number;
  teamSpectator: number;
  teamNumber: number;
  preMade: number;
  escapeState: number;

  // ── 킬 / 어시 / 데스
  playerKill: number;
  playerAssistant: number;
  monsterKill: number;
  playerDeaths: number;
  teamKill: number;
  totalFieldKill: number;
  teamElimination: number;
  teamDown: number;
  totalDoubleKill: number;
  totalTripleKill: number;
  totalQuadraKill: number;
  totalExtraKill: number;
  killGamma: boolean;

  // 페이즈별 킬/데스
  killsPhaseOne: number;
  killsPhaseTwo: number;
  killsPhaseThree: number;
  deathsPhaseOne: number;
  deathsPhaseTwo: number;
  deathsPhaseThree: number;

  // ── 무기
  bestWeapon: number;
  bestWeaponLevel: number;

  // ── 시간 (초)
  startDtm: string;
  duration: number;
  playTime: number;
  watchTime: number;
  totalTime: number;
  survivableTime: number;

  // ── MMR
  mmrBefore: number;
  mmrGain: number;
  mmrAfter: number;
  rankPoint: number;
  mmrAvg: number;
  matchSize: number;
  gainedNormalMmrKFactor: number;

  // ── 스탯 (게임 종료 시점)
  maxHp: number;
  maxSp: number;
  attackPower: number;
  defense: number;
  hpRegen: number;
  spRegen: number;
  attackSpeed: number;
  moveSpeed: number;
  outOfCombatMoveSpeed: number;
  sightRange: number;
  attackRange: number;
  criticalStrikeChance: number;
  criticalStrikeDamage: number;
  coolDownReduction: number;
  lifeSteal: number;
  normalLifeSteal: number;
  skillLifeSteal: number;
  amplifierToMonster: number;
  trapDamage: number;
  adaptiveForce: number;
  adaptiveForceAttack: number;
  adaptiveForceAmplify: number;
  skillAmp: number;

  // ── 데미지 (플레이어 대상)
  damageToPlayer: number;
  damageToPlayer_trap: number;
  damageToPlayer_basic: number;
  damageToPlayer_skill: number;
  damageToPlayer_itemSkill: number;
  damageToPlayer_direct: number;
  damageToPlayer_uniqueSkill: number;
  damageToPlayer_Shield: number;

  // ── 데미지 (플레이어 수신)
  damageFromPlayer: number;
  damageFromPlayer_trap: number;
  damageFromPlayer_basic: number;
  damageFromPlayer_skill: number;
  damageFromPlayer_itemSkill: number;
  damageFromPlayer_direct: number;
  damageFromPlayer_uniqueSkill: number;

  // ── 데미지 (몬스터)
  damageToMonster: number;
  damageToMonster_trap: number;
  damageToMonster_basic: number;
  damageToMonster_skill: number;
  damageToMonster_itemSkill: number;
  damageToMonster_direct: number;
  damageToMonster_uniqueSkill: number;
  damageFromMonster: number;
  damageOffsetedByShield_Player: number;
  damageOffsetedByShield_Monster: number;

  // ── 회복 / 보호막 / CC
  healAmount: number;
  teamRecover: number;
  protectAbsorb: number;
  ccTimeToPlayer: number;

  // ── 제작
  craftUncommon: number;
  craftRare: number;
  craftEpic: number;
  craftLegend: number;
  craftMythic: number;

  // ── 경험치
  gainExp: number;
  baseExp: number;
  bonusExp: number;
  bonusCoin: number;

  // ── 오브젝트
  addSurveillanceCamera: number;
  addTelephotoCamera: number;
  removeSurveillanceCamera: number;
  removeTelephotoCamera: number;
  useHyperLoop: number;
  useSecurityConsole: number;
  usedPairLoop: number;
  totalTurbineTakeOver: number;
  fishingCount: number;
  useEmoticonCount: number;

  // ── 전술 스킬
  tacticalSkillGroup: number;
  tacticalSkillLevel: number;
  /** ER 일부 응답 — 옥타곤 결투축 산출에 사용 */
  tacticalSkillUseCount?: number;
  /** ER 일부 응답 — 옥타곤 시야축 산출에 사용 */
  viewContribution?: number;

  // ── 치료팩 / 실드팩
  usedNormalHealPack: number;
  usedReinforcedHealPack: number;
  usedNormalShieldPack: number;
  usedReinforceShieldPack: number;

  // ── 루트
  routeIdOfStart: number;
  routeSlotId: number;
  placeOfStart: string;

  // ── VF 크레딧 요약
  totalGainVFCredit: number;
  totalUseVFCredit: number;
  sumUsedVFCredits: number;
  activelyGainedCredits: number;
  killPlayerGainVFCredit: number;
  killChickenGainVFCredit: number;
  killBoarGainVFCredit: number;
  killWildDogGainVFCredit: number;
  killWolfGainVFCredit: number;
  killBearGainVFCredit: number;
  killOmegaGainVFCredit: number;
  killBatGainVFCredit: number;
  killWicklineGainVFCredit: number;
  killAlphaGainVFCredit: number;
  killItemBountyGainVFCredit: number;
  killDroneGainVFCredit: number;
  killGammaGainVFCredit: number;
  killTurretGainVFCredit: number;
  itemShredderGainVFCredit: number;
  remoteDroneUseVFCreditMySelf: number;
  remoteDroneUseVFCreditAlly: number;
  transferConsoleFromMaterialUseVFCredit: number;
  transferConsoleFromEscapeKeyUseVFCredit: number;
  transferConsoleFromRevivalUseVFCredit: number;
  tacticalSkillUpgradeUseVFCredit: number;
  infusionReRollUseVFCredit: number;
  infusionTraitUseVFCredit: number;
  infusionRelicUseVFCredit: number;
  infusionStoreUseVFCredit: number;

  // ── JSONB / 복합 필드
  masteryLevel: Record<string, number>;       // { weaponType: level }
  equipment: Record<string, number>;          // { slot: itemCode }
  equipmentGrade: Record<string, number>;     // { slot: grade }
  skillLevelInfo: Record<string, number>;     // { skillCode: level }
  skillOrderInfo: Record<string, number>;     // { order: skillCode }
  killMonsters: Record<string, number>;       // { monsterType: count }
  creditSource: Record<string, number>;       // { sourceKey: amount }
  eventMissionResult: Record<string, number>;

  // 특성
  traitFirstCore: number;
  traitFirstSub: number[];
  traitSecondSub: number[];

  // 배열 (등급별 7개)
  airSupplyOpenCount: number[];
  foodCraftCount: number[];
  beverageCraftCount: number[];

  // 배열 (시간대별 20개)
  totalVFCredits: number[];
  usedVFCredits: number[];
  scoredPoint: number[];

  // 배틀존 (1~3)
  battleZone1AreaCode: number;
  battleZone1BattleMark: number;
  battleZone1ItemCode: number[];
  battleZone1Winner: number;
  battleZone1BattleMarkCount: number;
  battleZone2AreaCode: number;
  battleZone2BattleMark: number;
  battleZone2ItemCode: number[];
  battleZone2Winner: number;
  battleZone2BattleMarkCount: number;
  battleZone3AreaCode: number;
  battleZone3BattleMark: number;
  battleZone3ItemCode: number[];
  battleZone3Winner: number;
  battleZone3BattleMarkCount: number;
  battleZonePlayerKill: number;
  battleZoneDeaths: number;

  // 킬러 정보 (최대 3명)
  killerUserNum: number;
  killer: string;
  killDetail: string;
  causeOfDeath: string;
  placeOfDeath: string;
  killerCharacter: string;
  killerWeapon: string;
  killerUserNum2: number;
  killer2: string;
  killDetail2: string;
  causeOfDeath2: string;
  placeOfDeath2: string;
  killerCharacter2: string;
  killerWeapon2: string;
  killerUserNum3: number;
  killer3?: string;
  killDetail3?: string;
  causeOfDeath3?: string;
  placeOfDeath3?: string;
  killerCharacter3?: string;
  killerWeapon3?: string;

  // 기타
  killDetails: string;
  deathDetails: string;
  botAdded: number;
  botRemain: number;
  restrictedAreaAccelerated: number;
  safeAreas: number;
  expireDtm: string;
  boughtInfusion: Record<string, unknown>;
  itemTransferredConsole: number[];
  itemTransferredDrone: number[];
  collectItemForLog: number[];
  equipFirstItemForLog: Record<string, number[]>;

  /** 백엔드 item 테이블(code + image_path) 기반 장비 이미지 매핑 */
  equipmentImages?: {
    slots?: Record<string, { code: number; nameKr?: string | null; nameEn?: string | null; imagePath?: string | null }>;
  };
}


// ── 백엔드 API 응답 타입 ────────────────────────────────────────

/** /api/v1/players/search — ER user 객체 정규화 */
export interface PlayerSearchResult {
  nickname: string;
  /** 닉네임 검색 응답의 userId — /v1/user/games/uid/{userId} 에 사용 */
  userId?: string | null;
}

/** 시즌 누적 캐릭터 스탯 (별도 API 없을 때는 null) */
export interface PlayerStats {
  nickname: string;
  seasonId: number;
  matchingMode: number;
  matchingTeamMode: number;
  mmr: number;
  rankPoint: number;
  totalGames: number;
  wins: number;
  losses: number;
  top3: number;
  averageRank: number;
  averageKills: number;
  averageAssistants: number;
  averageHunts: number;
  characterStats: CharacterStat[];
}

export interface CharacterStat {
  characterNum: number;
  usages: number;
  maxKillings: number;
  top3: number;
  wins: number;
  averageRank: number;
}

/** /api/players/games/by-user-id */
export interface PlayerGamesResponse {
  games: UserGame[];
  next: string | null;   // cursor for next page
}

/** /api/octagon/by-user-id */
export interface OctagonScore {
  userId: string;
  seasonId: number;
  matchingMode: number;
  /** 전투·결투 통합 (DPM·킬·스킬비중 + 킬관여·어시·전술·CC) */
  engagement: number;
  hunting: number;
  vision: number;
  survival: number;
  /** 회복·보호막·팀 회복 */
  sustain: number;
  centerGrade: string;
  gamesAnalyzed: number;
}


// ── 프론트엔드 조합 타입 ────────────────────────────────────────

/** 플레이어 프로필 페이지용 통합 타입 */
export interface PlayerProfile {
  userId: string | null;
  nickname: string;
  accountLevel: number;
  rankPoint: number;
  tier: string;
  lastSyncAt: string | null;
  stats: PlayerStats | null;
  octagon: OctagonScore | null;
  recentGames: UserGame[];
  // 프론트에서 계산
  winRate: number;
  totalGames: number;
  avgKill: number;
  avgDamage: number;
  avgRank: number;
}

/** 메타 브리핑 (AI) */
export interface MetaBriefing {
  date: string;
  topPicks: { characterName: string; characterNum: number; pickRate: number }[];
  topWinRate: { characterName: string; characterNum: number; winRate: number }[];
  summary: string;
}

/** 루트 추천 (AI) */
export interface RouteRecommendation {
  routeId: number;
  startArea: string;
  tacticalSkillGroup: number;
  tacticalSkillName: string;
  priorityItems: string[];
  reasoning: string;
}

/** GET /api/v1/catalog/characters — Supabase character 테이블 */
export interface CharacterCatalogItem {
  characterNum: number;
  name: string;
  nameKo: string | null;
  nameEn: string | null;
  weaponType?: number | null;
  weaponCode?: number | null;
  /** CharacterAttributes → WeaponTypeInfo 코드(best_weapon), 비어 있으면 제한 없음으로 취급 가능 */
  masteryWeaponCodes?: number[];
}

export interface CharacterCatalogResponse {
  items: CharacterCatalogItem[];
}

/** POST /api/v1/ai/combo-win-probability */
export interface ComboWinProbabilityRequest {
  characterNums: [number, number, number];
  bestWeapons: [number, number, number];
}

export interface ComboWinProbabilityResponse {
  winProbability: number;
  modelPath: string;
}

/** /api/v1/stats/characters — characterName은 Supabase character.nameKo 우선 */
export interface CharacterStatsRow {
  characterNum: number;
  weaponId: number;
  weaponName: string | null;
  characterName: string | null;
  games: number;
  tierScore: number;
  tierGrade: string;
  pickRatePct: number;
  weaponPickRateInCharacterPct: number;
  winRatePct: number;
  top3RatePct: number;
  adjWinRatePct: number;
  adjTop3RatePct: number;
  pickPenalty: number;
  avgRank: number;
  avgDamage: number;
  avgDamageToMonster: number;
  avgRpGain: number;
  avgTk: number;
  avgKill: number;
}

export interface CharacterStatsResponse {
  totalGames: number;
  count: number;
  items: CharacterStatsRow[];
}
