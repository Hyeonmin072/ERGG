import type { CharacterCatalogItem } from "./types";

function toPositiveInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return Math.trunc(v);
  if (typeof v === "string" && /^\d+$/.test(v)) {
    const n = parseInt(v, 10);
    return n > 0 ? n : null;
  }
  return null;
}

/**
 * character.masteryWeaponCodes — 비어 있으면 해당 캐릭터 기본 무기(weaponCode)만 허용으로 간주.
 */
export function getMasteryWeaponCodesForCharacter(
  characterNum: number,
  catalogItems: CharacterCatalogItem[]
): number[] {
  const row = catalogItems.find((i) => i.characterNum === characterNum);
  const raw = row?.masteryWeaponCodes;
  const fromMastery: number[] = [];
  if (Array.isArray(raw)) {
    for (const x of raw) {
      const n = toPositiveInt(x);
      if (n != null) fromMastery.push(n);
    }
  }
  const unique = [...new Set(fromMastery)].sort((a, b) => a - b);
  if (unique.length > 0) return unique;

  const fallback = toPositiveInt(row?.weaponCode);
  return fallback != null ? [fallback] : [1];
}
