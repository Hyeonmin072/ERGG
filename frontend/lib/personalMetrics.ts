import type { PlayerStats, UserGame } from "./types";
import { CHARACTER_NAMES } from "./mock";

export interface CombatRollups {
  avgDamage: number;
  avgHeal: number;
  avgSight: number;
  avgMonsterKill: number;
  avgDeaths: number;
  avgAssist: number;
  kdRatio: number;
}

export function aggregateCombatMetrics(games: UserGame[]): CombatRollups | null {
  if (games.length === 0) return null;
  const n = games.length;
  const sum = (pick: (g: UserGame) => number) => games.reduce((a, g) => a + pick(g), 0);
  const kills = sum((g) => g.playerKill);
  const deaths = sum((g) => g.playerDeaths);
  return {
    avgDamage: Math.round(sum((g) => g.damageToPlayer) / n),
    avgHeal: Math.round(sum((g) => g.healAmount) / n),
    avgSight: Math.round((sum((g) => g.sightRange) / n) * 10) / 10,
    avgMonsterKill: Math.round((sum((g) => g.monsterKill) / n) * 10) / 10,
    avgDeaths: Math.round((sum((g) => g.playerDeaths) / n) * 10) / 10,
    avgAssist: Math.round((sum((g) => g.playerAssistant) / n) * 10) / 10,
    kdRatio: deaths > 0 ? Math.round((kills / deaths) * 100) / 100 : kills,
  };
}

export interface CharacterUsageRow {
  characterNum: number;
  name: string;
  count: number;
  pct: number;
}

/** 최근 전적에서 픽 분포 */
export function characterUsageFromGames(games: UserGame[], top = 8): CharacterUsageRow[] {
  const map = new Map<number, number>();
  for (const g of games) {
    map.set(g.characterNum, (map.get(g.characterNum) ?? 0) + 1);
  }
  const total = games.length || 1;
  return [...map.entries()]
    .map(([characterNum, count]) => ({
      characterNum,
      count,
      name: CHARACTER_NAMES[characterNum] ?? `#${characterNum}`,
      pct: Math.round((count / total) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);
}

/** API 캐릭터 스탯 → 표시용 (있으면 우선) */
export function characterUsageFromStats(stats: PlayerStats | null, top = 8): CharacterUsageRow[] {
  if (!stats?.characterStats?.length) return [];
  const list = [...stats.characterStats].sort((a, b) => b.usages - a.usages).slice(0, top);
  const total = list.reduce((s, c) => s + c.usages, 0) || 1;
  return list.map((c) => ({
    characterNum: c.characterNum,
    name: CHARACTER_NAMES[c.characterNum] ?? `#${c.characterNum}`,
    count: c.usages,
    pct: Math.round((c.usages / total) * 1000) / 10,
  }));
}

export interface RecentGameMetric {
  gameId: number;
  rank: number;
  damage: number;
  kills: number;
  deaths: number;
  assists: number;
  victory: boolean;
  characterNum: number;
  characterName: string;
}

export function recentGamesMetrics(games: UserGame[], limit = 12): RecentGameMetric[] {
  return games.slice(0, limit).map((g) => ({
    gameId: g.gameId,
    rank: g.gameRank,
    damage: g.damageToPlayer,
    kills: g.playerKill,
    deaths: g.playerDeaths,
    assists: g.playerAssistant,
    victory: g.victory === 1 || g.gameRank === 1,
    characterNum: g.characterNum,
    characterName: CHARACTER_NAMES[g.characterNum] ?? `#${g.characterNum}`,
  }));
}
