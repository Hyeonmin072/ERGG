/**
 * IN1000(상위 1000 RP 구간) 실험체·무기별 평균 통계 — 데모 목 데이터.
 */
import { COMBO_CHARACTER_DEFAULT_DIRS } from "./characterDefaultMini";
import type { ComboRosterName } from "./comboRoster";

export interface WeaponIn1000Row {
  characterKo: ComboRosterName;
  weaponName: string;
  games: number;
  winRate: number;
  avgRank: number;
  avgKill: number;
  avgAssist: number;
  avgDeath: number;
  avgDamage: number;
  /** 동일 실험체 내 무기 픽 비중 % (데모) */
  weaponSharePct: number;
}

function seeded(char: string, weapon: string): number {
  const s = `${char}\0${weapon}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function makeRow(
  characterKo: ComboRosterName,
  weaponName: string,
  weaponSharePct: number
): WeaponIn1000Row {
  const h = seeded(characterKo, weaponName);
  const games = 120 + (h % 520);
  const winRate = Math.round((42 + (h % 180) / 10) * 10) / 10;
  const avgRank = Math.round((35 + (h % 80) / 10) * 10) / 10;
  const avgKill = Math.round((h % 80) / 10) / 10;
  const avgAssist = Math.round((h % 60) / 10) / 10;
  const avgDeath = Math.round((18 + (h % 50)) / 10) / 10;
  const avgDamage = 8000 + (h % 12000);
  return {
    characterKo,
    weaponName,
    games,
    winRate,
    avgRank,
    avgKill,
    avgAssist,
    avgDeath,
    avgDamage,
    weaponSharePct: weaponSharePct,
  };
}

const RAW: { c: ComboRosterName; weapons: { name: string; share: number }[] }[] = [
  { c: "재키", weapons: [{ name: "단검", share: 44 }, { name: "양손검", share: 36 }, { name: "도끼", share: 20 }] },
  { c: "아야", weapons: [{ name: "활", share: 52 }, { name: "쌍권총", share: 31 }, { name: "석궁", share: 17 }] },
  { c: "현우", weapons: [{ name: "글러브", share: 48 }, { name: "톤파", share: 29 }, { name: "망치", share: 23 }] },
  { c: "매그너스", weapons: [{ name: "방패", share: 41 }, { name: "양손검", share: 39 }, { name: "도끼", share: 20 }] },
  { c: "피오라", weapons: [{ name: "레이피어", share: 55 }, { name: "양손검", share: 28 }, { name: "창", share: 17 }] },
  { c: "나딘", weapons: [{ name: "총검", share: 46 }, { name: "레이피어", share: 33 }, { name: "카메라", share: 21 }] },
  { c: "하트", weapons: [{ name: "방망이", share: 38 }, { name: "글러브", share: 37 }, { name: "망치", share: 25 }] },
  { c: "자히르", weapons: [{ name: "단검", share: 50 }, { name: "양손검", share: 30 }, { name: "창", share: 20 }] },
  { c: "아이솔", weapons: [{ name: "레이피어", share: 43 }, { name: "창", share: 34 }, { name: "톤파", share: 23 }] },
  { c: "리 다이린", weapons: [{ name: "쌍검", share: 47 }, { name: "단검", share: 32 }, { name: "레이피어", share: 21 }] },
  { c: "유키", weapons: [{ name: "양손검", share: 40 }, { name: "도끼", share: 35 }, { name: "창", share: 25 }] },
  { c: "혜진", weapons: [{ name: "글러브", share: 45 }, { name: "톤파", share: 30 }, { name: "쌍검", share: 25 }] },
];

export const WEAPON_IN1000_MOCK_ROWS: WeaponIn1000Row[] = RAW.filter(
  (row) => row.c in COMBO_CHARACTER_DEFAULT_DIRS
).flatMap(({ c, weapons }) => weapons.map((w) => makeRow(c, w.name, w.share)));

export const IN1000_META = {
  label: "IN1000",
  description: "상위 1000 RP 구간 플레이어 전적 샘플 기준 (데모)",
  seasonLabel: "시즌 33 · 스쿼드 랭크",
  lastUpdated: "2026-04-01",
};
