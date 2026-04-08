/**
 * 랭크 RP → 티어·디비전 표시.
 * 상위 티어는 래더 순위 기준(이터니티/데미갓)으로 우선 판정한다.
 * - 이터니티: 상위 300위 이내
 * - 데미갓: 상위 1000위 이내(이터니티 제외)
 * 순위 정보가 없으면 RP 구간으로 판정한다.
 */

export type TierBand =
  | "iron"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "meteorite"
  | "mithril"
  | "demigod";

/** min~max(포함) 구간, 높은 RP부터 매칭 */
const TIER_ROWS_DESC: { min: number; max: number; label: string }[] = [
  { min: 7400, max: Number.MAX_SAFE_INTEGER, label: "미스릴" },
  { min: 7150, max: 7399, label: "메테오라이트 I" },
  { min: 6900, max: 7149, label: "메테오라이트 II" },
  { min: 6650, max: 6899, label: "메테오라이트 III" },
  { min: 6400, max: 6649, label: "메테오라이트 IV" },
  { min: 6050, max: 6399, label: "다이아몬드 I" },
  { min: 5700, max: 6049, label: "다이아몬드 II" },
  { min: 5350, max: 5699, label: "다이아몬드 III" },
  { min: 5000, max: 5349, label: "다이아몬드 IV" },
  { min: 4650, max: 4999, label: "플래티넘 I" },
  { min: 4300, max: 4649, label: "플래티넘 II" },
  { min: 3950, max: 4299, label: "플래티넘 III" },
  { min: 3600, max: 3949, label: "플래티넘 IV" },
  { min: 3300, max: 3599, label: "골드 I" },
  { min: 3000, max: 3299, label: "골드 II" },
  { min: 2700, max: 2999, label: "골드 III" },
  { min: 2400, max: 2699, label: "골드 IV" },
  { min: 2150, max: 2399, label: "실버 I" },
  { min: 1900, max: 2149, label: "실버 II" },
  { min: 1650, max: 1899, label: "실버 III" },
  { min: 1400, max: 1649, label: "실버 IV" },
  { min: 1200, max: 1399, label: "브론즈 I" },
  { min: 1000, max: 1199, label: "브론즈 II" },
  { min: 800, max: 999, label: "브론즈 III" },
  { min: 600, max: 799, label: "브론즈 IV" },
  { min: 450, max: 599, label: "아이언 I" },
  { min: 300, max: 449, label: "아이언 II" },
  { min: 150, max: 299, label: "아이언 III" },
  { min: 0, max: 149, label: "아이언 IV" },
];

export function getTierFromRP(rp: number): string {
  const n = Math.floor(rp);
  if (n < 0) return "언랭크";
  for (const row of TIER_ROWS_DESC) {
    if (n >= row.min && n <= row.max) return row.label;
  }
  return "언랭크";
}

export function getTopTierFromLadderRank(ladderRank?: number | null): string | null {
  if (ladderRank == null) return null;
  const n = Math.floor(ladderRank);
  if (n <= 0) return null;
  if (n <= 300) return "이터니티";
  if (n <= 1000) return "데미갓";
  return null;
}

export function getTierFromRankOrRP(rp: number, ladderRank?: number | null): string {
  return getTopTierFromLadderRank(ladderRank) ?? getTierFromRP(rp);
}

export function getTierBandFromRP(rp: number): TierBand {
  const n = Math.floor(rp);
  if (n >= 7400) return "mithril";
  if (n >= 6400) return "meteorite";
  if (n >= 5000) return "diamond";
  if (n >= 3600) return "platinum";
  if (n >= 2400) return "gold";
  if (n >= 1400) return "silver";
  if (n >= 600) return "bronze";
  return "iron";
}

export function getTierBandFromRankOrRP(rp: number, ladderRank?: number | null): TierBand {
  const topTier = getTopTierFromLadderRank(ladderRank);
  if (topTier === "이터니티" || topTier === "데미갓") return "demigod";
  return getTierBandFromRP(rp);
}

const BAND_COLOR: Record<TierBand, string> = {
  iron: "#78909c",
  bronze: "#a0785a",
  silver: "#b0bec5",
  gold: "#ffa726",
  platinum: "#40c4ff",
  diamond: "#00d4ff",
  meteorite: "#ba68c8",
  mithril: "#ffd700",
  demigod: "#e040fb",
};

const BAND_IMAGE: Record<TierBand, string> = {
  iron: "/images/tier/01.%20Iron.png",
  bronze: "/images/tier/02.%20Bronze.png",
  silver: "/images/tier/03.%20Silver.png",
  gold: "/images/tier/04.%20Gold.png",
  platinum: "/images/tier/05.%20Platinum.png",
  diamond: "/images/tier/06.%20Diamond.png",
  meteorite: "/images/tier/07.%20Meteorite.png",
  mithril: "/images/tier/08.%20Mithril.png",
  demigod: "/images/tier/09.%20Titan.png",
};

export function getTierColorFromRP(rp: number): string {
  return BAND_COLOR[getTierBandFromRP(rp)] ?? "#94a3b8";
}

export function getTierColorFromRankOrRP(rp: number, ladderRank?: number | null): string {
  return BAND_COLOR[getTierBandFromRankOrRP(rp, ladderRank)] ?? "#94a3b8";
}

export function getTierImageFromRP(rp: number): string {
  return BAND_IMAGE[getTierBandFromRP(rp)] ?? "/images/tier/00.%20Unrank.png";
}

export function getTierImageFromRankOrRP(rp: number, ladderRank?: number | null): string {
  const topTier = getTopTierFromLadderRank(ladderRank);
  if (topTier === "이터니티") return "/images/tier/10.%20Immortal.png";
  if (topTier === "데미갓") return "/images/tier/09.%20Titan.png";
  return BAND_IMAGE[getTierBandFromRankOrRP(rp, ladderRank)] ?? "/images/tier/00.%20Unrank.png";
}

/** 티어 문자열(라벨)만 있을 때 — 색/이미지 추정 */
function bandFromTierLabel(tier: string): TierBand {
  const t = tier.trim();
  if (t.includes("데미갓")) return "demigod";
  if (t.includes("이터")) return "demigod";
  if (t.includes("미스릴")) return "mithril";
  if (t.includes("메테오라이트")) return "meteorite";
  if (t.includes("다이아")) return "diamond";
  if (t.includes("플래티넘")) return "platinum";
  if (t.includes("골드")) return "gold";
  if (t.includes("실버")) return "silver";
  if (t.includes("브론즈")) return "bronze";
  if (t.includes("아이언")) return "iron";
  return "iron";
}

/** @deprecated 가능하면 getTierColorFromRP(rankPoint) 사용 */
export function getTierColor(tier: string): string {
  return BAND_COLOR[bandFromTierLabel(tier)] ?? "#94a3b8";
}

/** @deprecated 가능하면 getTierImageFromRP(rankPoint) 사용 */
export function getTierImage(tier: string): string {
  const t = tier.trim();
  if (t.includes("이터")) return "/images/tier/10.%20Immortal.png";
  if (t.includes("데미갓")) return "/images/tier/09.%20Titan.png";
  return BAND_IMAGE[bandFromTierLabel(tier)] ?? "/images/tier/00.%20Unrank.png";
}
