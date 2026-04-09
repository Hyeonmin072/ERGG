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

/** 안전 우선순위: catalog(DB) → 로컬 매핑 → #characterNum */
export function resolveCharacterDisplayName(
  characterNum: number,
  catalog?: CharacterCatalogMap | null
): string {
  const c = catalog?.[characterNum];
  const ko = c?.nameKo?.trim();
  if (ko) return ko;
  const n = c?.name?.trim();
  if (n) return n;
  const fromNum = CHARACTER_NAMES[characterNum]?.trim();
  if (fromNum) return fromNum;
  return `#${characterNum}`;
}
