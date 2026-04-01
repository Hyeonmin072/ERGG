import { CHARACTER_NAMES } from "./mock";
import type { CharacterCatalogItem } from "./types";

export type CharacterCatalogMap = Record<number, CharacterCatalogItem>;

export function buildCharacterCatalogMap(
  items: CharacterCatalogItem[]
): CharacterCatalogMap {
  const m: CharacterCatalogMap = {};
  for (const it of items) {
    m[it.characterNum] = it;
  }
  return m;
}

/** characterNum(전적 API) 우선 → 카탈로그(DB)는 신규 슬롯 등 폴백 */
export function resolveCharacterDisplayName(
  characterNum: number,
  catalog?: CharacterCatalogMap | null
): string {
  const fromNum = CHARACTER_NAMES[characterNum]?.trim();
  if (fromNum) return fromNum;
  const c = catalog?.[characterNum];
  const ko = c?.nameKo?.trim();
  if (ko) return ko;
  const n = c?.name?.trim();
  if (n) return n;
  return `#${characterNum}`;
}
