import type { PlayerProfile, MetaBriefing } from "./types";

export const CHARACTER_NAMES: Record<number, string> = {
  1: "재키", 2: "핀", 3: "야", 4: "재클린", 5: "나딘", 6: "아이솔", 7: "노아",
  8: "하비", 9: "레나", 10: "에이든", 11: "쿠인시", 12: "현우", 13: "나쟈",
  14: "에마", 15: "시어도어", 16: "로지", 17: "레온", 18: "시즈카", 19: "피오라",
  20: "나타", 21: "누나리", 22: "다니엘라", 23: "제이", 24: "이반", 25: "마스",
  26: "티아나", 27: "요릭", 28: "시린", 29: "에카테리나", 30: "실리아",
  31: "리오", 32: "기예르모", 33: "카밀로", 34: "루크", 35: "엘레나",
  36: "유키", 37: "아키", 38: "클로에", 39: "살바토르", 40: "쿠이라",
  41: "포포", 42: "스타시아", 43: "조수아", 44: "아델라", 45: "다이애나",
  46: "라피나", 47: "발트", 48: "스웨인", 49: "에르네스토", 50: "에이다",
  51: "안나", 52: "미란다", 53: "다니아", 54: "마야", 55: "파티마",
  56: "브라이어", 57: "바이올렛", 58: "니콜라이", 59: "니키", 60: "엘지",
  61: "수지", 62: "이안", 63: "이자벨", 64: "루비", 65: "마르티나",
  66: "윌리엄", 67: "클로드", 68: "마리아", 69: "루미", 70: "가브리엘",
  71: "유진", 72: "에릭", 73: "줄리아", 74: "이리나", 75: "알렉스",
  76: "잔느", 77: "벤자민", 78: "아키하바라", 79: "타마라",
};

export const TIER_NAMES: Record<string, string> = {
  "titan": "타이탄", "immortal": "이모탈", "diamond": "다이아",
  "platinum": "플래티넘", "gold": "골드", "silver": "실버",
  "bronze": "브론즈", "iron": "아이언",
};

export function getTierFromRP(rp: number): string {
  if (rp >= 6400) return "타이탄";
  if (rp >= 5800) return "이모탈";
  if (rp >= 5200) return "다이아";
  if (rp >= 4600) return "플래티넘";
  if (rp >= 4000) return "골드";
  if (rp >= 3400) return "실버";
  if (rp >= 2800) return "브론즈";
  return "아이언";
}

export function getTierColor(tier: string): string {
  const map: Record<string, string> = {
    "타이탄": "#ffd700", "이모탈": "#e040fb", "다이아": "#00d4ff",
    "플래티넘": "#40c4ff", "골드": "#ffa726", "실버": "#b0bec5",
    "브론즈": "#a0785a", "아이언": "#78909c",
  };
  return map[tier] ?? "#94a3b8";
}

export function getTierImage(tier: string): string {
  const map: Record<string, string> = {
    "타이탄":   "/images/tier/09.%20Titan.png",
    "이모탈":   "/images/tier/10.%20Immortal.png",
    "다이아":   "/images/tier/06.%20Diamond.png",
    "플래티넘": "/images/tier/05.%20Platinum.png",
    "골드":     "/images/tier/04.%20Gold.png",
    "실버":     "/images/tier/03.%20Silver.png",
    "브론즈":   "/images/tier/02.%20Bronze.png",
    "아이언":   "/images/tier/01.%20Iron.png",
  };
  return map[tier] ?? "/images/tier/00.%20Unrank.png";
}

export function getGradeColor(grade: string): string {
  const map: Record<string, string> = {
    "S+": "#ffd700", "S": "#e040fb", "A+": "#00d4ff",
    "A": "#40c4ff", "B+": "#ffa726", "B": "#b0bec5",
    "C+": "#a0785a", "C": "#78909c",
  };
  return map[grade] ?? "#94a3b8";
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export const MOCK_PLAYER: PlayerProfile = {
  userNum: 4095353,
  nickname: "김현민",
  accountLevel: 139,
  rankPoint: 4960,
  tier: "플래티넘",
  lastSyncAt: "2026-03-24T10:00:00",
  winRate: 38.5,
  totalGames: 87,
  avgKill: 1.2,
  avgDamage: 6840,
  avgRank: 7.3,
  octagon: {
    combat: 72,
    takedown: 58,
    hunting: 80,
    vision: 35,
    mastery: 68,
    survival: 52,
    centerGrade: "A",
    gamesAnalyzed: 20,
  },
  recentGames: [
    {
      gameId: 51151757, startDtm: "2025-08-12T01:58:38", characterNum: 78,
      characterName: "아키하바라", gameRank: 8, playerKill: 0, playerAssistant: 1,
      monsterKill: 10, damageToPlayer: 7183, mmrGain: -24, victory: 0,
      duration: 416, bestWeapon: 16, bestWeaponLevel: 9, matchingMode: 3,
      matchingTeamMode: 3, teamKill: 5,
    },
    {
      gameId: 51140001, startDtm: "2025-08-11T22:30:00", characterNum: 35,
      characterName: "엘레나", gameRank: 2, playerKill: 4, playerAssistant: 2,
      monsterKill: 18, damageToPlayer: 14200, mmrGain: 48, victory: 0,
      duration: 1120, bestWeapon: 40, bestWeaponLevel: 11, matchingMode: 3,
      matchingTeamMode: 3, teamKill: 12,
    },
    {
      gameId: 51130002, startDtm: "2025-08-11T20:10:00", characterNum: 78,
      characterName: "아키하바라", gameRank: 1, playerKill: 6, playerAssistant: 3,
      monsterKill: 22, damageToPlayer: 19850, mmrGain: 72, victory: 1,
      duration: 1580, bestWeapon: 16, bestWeaponLevel: 12, matchingMode: 3,
      matchingTeamMode: 3, teamKill: 15,
    },
    {
      gameId: 51120003, startDtm: "2025-08-10T19:45:00", characterNum: 12,
      characterName: "현우", gameRank: 5, playerKill: 2, playerAssistant: 1,
      monsterKill: 15, damageToPlayer: 9200, mmrGain: -8, victory: 0,
      duration: 820, bestWeapon: 20, bestWeaponLevel: 10, matchingMode: 3,
      matchingTeamMode: 3, teamKill: 8,
    },
    {
      gameId: 51110004, startDtm: "2025-08-10T17:00:00", characterNum: 78,
      characterName: "아키하바라", gameRank: 3, playerKill: 3, playerAssistant: 4,
      monsterKill: 20, damageToPlayer: 12400, mmrGain: 24, victory: 0,
      duration: 1200, bestWeapon: 16, bestWeaponLevel: 11, matchingMode: 3,
      matchingTeamMode: 3, teamKill: 10,
    },
  ],
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
  summary: "오늘 아시아 서버는 엘레나·나쟈 중심의 교전 메타가 강세입니다. 특히 나쟈는 승률 62%로 압도적 1위를 기록 중이며, 현우의 초반 점령 후 성장 루트가 2인큐 상위권에서 유행하고 있습니다. 레이피어 계열 무기의 사용량이 전주 대비 +23% 증가했습니다.",
};
