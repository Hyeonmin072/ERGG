export interface OctagonScore {
  combat: number;
  takedown: number;
  hunting: number;
  vision: number;
  mastery: number;
  survival: number;
  centerGrade: string;
  gamesAnalyzed: number;
}

export interface GameSummary {
  gameId: number;
  startDtm: string;
  characterNum: number;
  characterName: string;
  gameRank: number;
  playerKill: number;
  playerAssistant: number;
  monsterKill: number;
  damageToPlayer: number;
  mmrGain: number;
  victory: number;
  duration: number;
  bestWeapon: number;
  bestWeaponLevel: number;
  matchingMode: number;
  matchingTeamMode: number;
  teamKill: number;
}

export interface PlayerProfile {
  userNum: number;
  nickname: string;
  accountLevel: number;
  rankPoint: number;
  tier: string;
  lastSyncAt: string;
  octagon: OctagonScore;
  recentGames: GameSummary[];
  winRate: number;
  totalGames: number;
  avgKill: number;
  avgDamage: number;
  avgRank: number;
}

export interface MetaBriefing {
  date: string;
  topPicks: { characterName: string; characterNum: number; pickRate: number }[];
  topWinRate: { characterName: string; characterNum: number; winRate: number }[];
  summary: string;
}

export interface RouteRecommendation {
  routeId: number;
  startArea: string;
  tacticalSkillGroup: number;
  tacticalSkillName: string;
  priorityItems: string[];
  reasoning: string;
}
