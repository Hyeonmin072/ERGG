// ============================================================
// ERGG 헬퍼 함수 + 목 데이터
// ============================================================
import type { PlayerProfile, UserGame, MetaBriefing, OctagonScore } from "./types";
import { COMBO_ROSTER_NAMES } from "./comboRoster";

// ── 캐릭터 이름 매핑 (BSER/ER userGames.characterNum = 조합 로스터 순서 1..N) ──

const _characterNames: Record<number, string> = {};
COMBO_ROSTER_NAMES.forEach((name, i) => {
  _characterNames[i + 1] = name;
});
export const CHARACTER_NAMES: Record<number, string> = _characterNames;

// ── 티어 유틸 (RP·디비전 구간은 lib/tier.ts) ─────────────────
import {
  getTierFromRP,
  getTierFromRankOrRP,
  getTierColorFromRP,
  getTierColorFromRankOrRP,
  getTierImageFromRP,
  getTierImageFromRankOrRP,
  getTierColor,
  getTierImage,
} from "./tier";
import { computeOctagonFromUserGames } from "./octagonFromGames";

export {
  getTierFromRP,
  getTierFromRankOrRP,
  getTierColorFromRP,
  getTierColorFromRankOrRP,
  getTierImageFromRP,
  getTierImageFromRankOrRP,
  getTierColor,
  getTierImage,
};

export function getGradeColor(grade: string): string {
  const map: Record<string, string> = {
    "S+": "#ffd700", "S": "#e040fb", "A+": "#00d4ff",
    "A": "#40c4ff", "B+": "#ffa726", "B": "#b0bec5",
    "C+": "#a0785a", "C": "#78909c",
  };
  return map[grade] ?? "#94a3b8";
}

// ── 포맷 유틸 ─────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

// ── 게임 통계 계산 유틸 ───────────────────────────────────────

/** 게임 목록에서 프로필 요약 통계 계산 */
export function calcProfileStats(games: UserGame[]) {
  if (games.length === 0) {
    return { winRate: 0, totalGames: 0, avgKill: 0, avgDamage: 0, avgRank: 0 };
  }
  const n = games.length;
  const wins = games.filter((g) => g.victory === 1 || g.gameRank === 1).length;
  return {
    winRate: Math.round((wins / n) * 1000) / 10,
    totalGames: n,
    avgKill: Math.round((games.reduce((s, g) => s + g.playerKill, 0) / n) * 10) / 10,
    avgDamage: Math.round(games.reduce((s, g) => s + g.damageToPlayer, 0) / n),
    avgRank: Math.round((games.reduce((s, g) => s + g.gameRank, 0) / n) * 10) / 10,
  };
}

/** 킬 관여율 계산 */
export function calcKillParticipation(game: UserGame): string {
  if (!game.teamKill || game.teamKill === 0) return "—";
  const rate = ((game.playerKill + game.playerAssistant) / game.teamKill) * 100;
  return `${Math.round(rate)}%`;
}

/** 매칭 모드 라벨 */
export function getMatchingModeLabel(mode: number): string {
  if (mode === 3) return "랭크";
  if (mode === 4) return "코발트";
  return "일반";
}

/** 팀 모드 라벨 (ER: 솔로·스쿼드(3인) 중심) */
export function getTeamModeLabel(teamMode: number): string {
  const map: Record<number, string> = { 1: "솔로", 3: "스쿼드", 4: "코발트" };
  return map[teamMode] ?? `팀 모드 ${teamMode}`;
}

// ── 목 데이터 ─────────────────────────────────────────────────

const BASE_GAME: UserGame = {
  nickname: "김현민", seasonId: 33,
  matchingMode: 3, matchingTeamMode: 3, accountLevel: 139,
  serverName: "Global", language: "Korean", versionMajor: 3, versionMinor: 0,
  // 게임별로 오버라이드되는 기본값
  gameId: 0, characterNum: 0, gameRank: 0, playerKill: 0, playerAssistant: 0,
  monsterKill: 0, playerDeaths: 0, damageToPlayer: 0, healAmount: 0,
  mmrBefore: 0, mmrGain: 0, mmrAfter: 0, rankPoint: 0, teamKill: 0,
  bestWeapon: 0, bestWeaponLevel: 0, playTime: 0, duration: 0,
  startDtm: "", victory: 0,
  skinCode: 0, characterLevel: 10, giveUp: 0,
  teamSpectator: 0, teamNumber: 4, preMade: 1, escapeState: 0,
  totalFieldKill: 5, teamElimination: 0, teamDown: 5,
  totalDoubleKill: 0, totalTripleKill: 0, totalQuadraKill: 0, totalExtraKill: 0,
  killGamma: false,
  killsPhaseOne: 0, killsPhaseTwo: 0, killsPhaseThree: 0,
  deathsPhaseOne: 1, deathsPhaseTwo: 1, deathsPhaseThree: 0,
  watchTime: 0, totalTime: 411, survivableTime: 30,
  mmrAvg: 4704, matchSize: 24, gainedNormalMmrKFactor: 0,
  maxHp: 1848, maxSp: 1074, attackPower: 261, defense: 118,
  hpRegen: 1.65, spRegen: 28.25, attackSpeed: 1.05, moveSpeed: 3.81,
  outOfCombatMoveSpeed: 3.81, sightRange: 8.5, attackRange: 2.05,
  criticalStrikeChance: 0, criticalStrikeDamage: 0, coolDownReduction: 0,
  lifeSteal: 0.07, normalLifeSteal: 0, skillLifeSteal: 0,
  amplifierToMonster: 12, trapDamage: 0,
  adaptiveForce: 0, adaptiveForceAttack: 0, adaptiveForceAmplify: 0, skillAmp: 0,
  damageToPlayer_trap: 0, damageToPlayer_basic: 1213, damageToPlayer_skill: 5970,
  damageToPlayer_itemSkill: 0, damageToPlayer_direct: 0, damageToPlayer_uniqueSkill: 0,
  damageToPlayer_Shield: 0,
  damageFromPlayer: 8869, damageFromPlayer_trap: 0, damageFromPlayer_basic: 1840,
  damageFromPlayer_skill: 6272, damageFromPlayer_itemSkill: 655,
  damageFromPlayer_direct: 102, damageFromPlayer_uniqueSkill: 0,
  damageToMonster: 10118, damageToMonster_trap: 0, damageToMonster_basic: 1379,
  damageToMonster_skill: 8739, damageToMonster_itemSkill: 0,
  damageToMonster_direct: 0, damageToMonster_uniqueSkill: 0,
  damageFromMonster: 836, damageOffsetedByShield_Player: 823, damageOffsetedByShield_Monster: 264,
  teamRecover: 0, protectAbsorb: 1087, ccTimeToPlayer: 0.86,
  craftUncommon: 8, craftRare: 6, craftEpic: 5, craftLegend: 0, craftMythic: 0,
  gainExp: 12, baseExp: 12, bonusExp: 0, bonusCoin: 0,
  addSurveillanceCamera: 0, addTelephotoCamera: 0,
  removeSurveillanceCamera: 0, removeTelephotoCamera: 0,
  useHyperLoop: 3, useSecurityConsole: 1, usedPairLoop: 3,
  totalTurbineTakeOver: 0, fishingCount: 0, useEmoticonCount: 5,
  tacticalSkillGroup: 30, tacticalSkillLevel: 1,
  usedNormalHealPack: 0, usedReinforcedHealPack: 0,
  usedNormalShieldPack: 0, usedReinforceShieldPack: 0,
  routeIdOfStart: 12299, routeSlotId: 0, placeOfStart: "190",
  totalGainVFCredit: 306, totalUseVFCredit: 15, sumUsedVFCredits: 15,
  activelyGainedCredits: 70, killPlayerGainVFCredit: 0,
  killChickenGainVFCredit: 22, killBoarGainVFCredit: 7, killWildDogGainVFCredit: 0,
  killWolfGainVFCredit: 10, killBearGainVFCredit: 8, killOmegaGainVFCredit: 0,
  killBatGainVFCredit: 5, killWicklineGainVFCredit: 0, killAlphaGainVFCredit: 0,
  killItemBountyGainVFCredit: 0, killDroneGainVFCredit: 0,
  killGammaGainVFCredit: 0, killTurretGainVFCredit: 0, itemShredderGainVFCredit: 0,
  remoteDroneUseVFCreditMySelf: 15, remoteDroneUseVFCreditAlly: 0,
  transferConsoleFromMaterialUseVFCredit: 0, transferConsoleFromEscapeKeyUseVFCredit: 0,
  transferConsoleFromRevivalUseVFCredit: 0, tacticalSkillUpgradeUseVFCredit: 0,
  infusionReRollUseVFCredit: 0, infusionTraitUseVFCredit: 0,
  infusionRelicUseVFCredit: 0, infusionStoreUseVFCredit: 0,
  masteryLevel: { "16": 9, "101": 8, "102": 4, "201": 11 },
  equipment: { "0": 102410, "1": 202420, "2": 201417, "3": 203412, "4": 204401 },
  equipmentGrade: { "0": 4, "1": 4, "2": 4, "3": 4, "4": 4 },
  skillLevelInfo: { "1078100": 2, "1078200": 2, "1078300": 3, "1078400": 1 },
  skillOrderInfo: { "1": 1078400, "2": 1078200, "3": 1078300 },
  killMonsters: { "1": 4, "3": 2, "5": 3, "6": 1 },
  creditSource: { "PreliminaryPhase": 15, "TimeElapsedCompensationByMiliSecond": 206 },
  eventMissionResult: { "310": 0 },
  traitFirstCore: 7000401, traitFirstSub: [7010901, 7011201], traitSecondSub: [7110101, 7110201],
  airSupplyOpenCount: [0, 0, 1, 0, 0, 0, 0],
  foodCraftCount: [0, 0, 3, 0, 0, 0, 0],
  beverageCraftCount: [0, 0, 0, 0, 0, 0, 0],
  totalVFCredits: [57, 47, 65, 46, 66, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  usedVFCredits: [0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  scoredPoint: new Array(20).fill(0),
  battleZone1AreaCode: 0, battleZone1BattleMark: 0, battleZone1ItemCode: [],
  battleZone1Winner: 0, battleZone1BattleMarkCount: 0,
  battleZone2AreaCode: 0, battleZone2BattleMark: 0, battleZone2ItemCode: [],
  battleZone2Winner: 0, battleZone2BattleMarkCount: 0,
  battleZone3AreaCode: 0, battleZone3BattleMark: 0, battleZone3ItemCode: [],
  battleZone3Winner: 0, battleZone3BattleMarkCount: 0,
  battleZonePlayerKill: 0, battleZoneDeaths: 0,
  killerUserNum: 781923, killer: "player", killDetail: "아키하바라",
  causeOfDeath: "격투 액션", placeOfDeath: "130",
  killerCharacter: "Nicky", killerWeapon: "Glove",
  killerUserNum2: 4881609, killer2: "player", killDetail2: "熊貓吃吃吃",
  causeOfDeath2: "엘레나 Q - 크리스탈 엘레강스", placeOfDeath2: "60",
  killerCharacter2: "Elena", killerWeapon2: "Rapier",
  killerUserNum3: 0, killer3: undefined,
  killDetails: "{}", deathDetails: '{"33":1,"50":1}',
  botAdded: 0, botRemain: 0, restrictedAreaAccelerated: 0, safeAreas: 20,
  expireDtm: "2025-11-10T02:05:35.035+0900",
  boughtInfusion: {}, itemTransferredConsole: [], itemTransferredDrone: [401105],
  collectItemForLog: [], equipFirstItemForLog: {},
};

export const MOCK_GAMES: UserGame[] = [
  {
    ...BASE_GAME,
    gameId: 51151757, startDtm: "2025-08-12T01:58:38.038+0900",
    characterNum: 78, gameRank: 8, playerKill: 0, playerAssistant: 1,
    monsterKill: 10, playerDeaths: 2, damageToPlayer: 7183,
    mmrBefore: 4984, mmrGain: -24, mmrAfter: 4960, rankPoint: 4960,
    bestWeapon: 16, bestWeaponLevel: 9, playTime: 411, duration: 416,
    healAmount: 6577, teamKill: 5,
  },
  {
    ...BASE_GAME,
    gameId: 51140001, startDtm: "2025-08-11T22:30:00.000+0900",
    characterNum: 35, gameRank: 2, playerKill: 4, playerAssistant: 2,
    monsterKill: 18, playerDeaths: 1, damageToPlayer: 14200,
    mmrBefore: 4936, mmrGain: 48, mmrAfter: 4984, rankPoint: 4984,
    bestWeapon: 40, bestWeaponLevel: 11, playTime: 1110, duration: 1120,
    healAmount: 12000, teamKill: 12,
  },
  {
    ...BASE_GAME,
    gameId: 51130002, startDtm: "2025-08-11T20:10:00.000+0900",
    characterNum: 78, gameRank: 1, victory: 1, playerKill: 6, playerAssistant: 3,
    monsterKill: 22, playerDeaths: 0, damageToPlayer: 19850,
    mmrBefore: 4864, mmrGain: 72, mmrAfter: 4936, rankPoint: 4936,
    bestWeapon: 16, bestWeaponLevel: 12, playTime: 1570, duration: 1580,
    healAmount: 18000, teamKill: 15,
  },
  {
    ...BASE_GAME,
    gameId: 51120003, startDtm: "2025-08-10T19:45:00.000+0900",
    characterNum: 12, gameRank: 5, playerKill: 2, playerAssistant: 1,
    monsterKill: 15, playerDeaths: 2, damageToPlayer: 9200,
    mmrBefore: 4872, mmrGain: -8, mmrAfter: 4864, rankPoint: 4864,
    bestWeapon: 20, bestWeaponLevel: 10, playTime: 810, duration: 820,
    healAmount: 7500, teamKill: 8,
  },
  {
    ...BASE_GAME,
    gameId: 51110004, startDtm: "2025-08-10T17:00:00.000+0900",
    characterNum: 78, gameRank: 3, playerKill: 3, playerAssistant: 4,
    monsterKill: 20, playerDeaths: 1, damageToPlayer: 12400,
    mmrBefore: 4848, mmrGain: 24, mmrAfter: 4872, rankPoint: 4872,
    bestWeapon: 16, bestWeaponLevel: 11, playTime: 1190, duration: 1200,
    healAmount: 11000, teamKill: 10,
  },
];

const mockStats = calcProfileStats(MOCK_GAMES);

const MOCK_OCTAGON: OctagonScore =
  computeOctagonFromUserGames(MOCK_GAMES, { userId: "mock-user-id", matchingMode: 3 }) ?? {
    userId: "mock-user-id",
    seasonId: 33,
    matchingMode: 3,
    engagement: 0,
    hunting: 0,
    vision: 0,
    survival: 0,
    sustain: 0,
    centerGrade: "C",
    gamesAnalyzed: 0,
  };

export const MOCK_PLAYER: PlayerProfile = {
  userId: "mock-user-id",
  nickname: "김현민",
  accountLevel: 139,
  rankPoint: 4960,
  tier: getTierFromRP(4960),
  lastSyncAt: "2026-03-24T10:00:00",
  stats: null,
  octagon: MOCK_OCTAGON,
  recentGames: MOCK_GAMES,
  ...mockStats,
};

export const MOCK_META: MetaBriefing = {
  date: "2026-03-24",
  topPicks: [
    { characterName: "엘레나", characterNum: 35, pickRate: 18.4 },
    { characterName: "나쟈", characterNum: 13, pickRate: 15.2 },
    { characterName: "현우", characterNum: 12, pickRate: 13.7 },
    { characterName: "아키하바라", characterNum: 78, pickRate: 11.1 },
    { characterName: "재클린", characterNum: 4, pickRate: 9.8 },
  ],
  topWinRate: [
    { characterName: "나쟈", characterNum: 13, winRate: 62.3 },
    { characterName: "현우", characterNum: 12, winRate: 58.9 },
    { characterName: "엘레나", characterNum: 35, winRate: 55.1 },
    { characterName: "재클린", characterNum: 4, winRate: 53.7 },
    { characterName: "핀", characterNum: 2, winRate: 52.4 },
  ],
  summary: "오늘은 엘레나·나쟈 중심의 교전 메타가 강세입니다. 특히 나쟈는 승률 62%로 압도적 1위를 기록 중이며, 현우의 초반 점령 후 성장 루트가 2인큐 상위권에서 유행하고 있습니다.",
};
