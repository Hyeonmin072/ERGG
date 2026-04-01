import type { ComboRosterName } from "./comboRoster";

/**
 * `public/images/character/default/{폴더명}/` 아래 `_Mini`가 포함된 기본 초상.
 * 현재 에셋 규칙: `{English}_Mini_00.png` (예: Jackie_Mini_00.png)
 *
 * 새 실험체 추가 시: 동일 폴더 구조로 넣고 여기에 `한글명 → 001.Jackie` 형태로만 매핑 추가.
 */
export const COMBO_CHARACTER_DEFAULT_DIRS: Partial<Record<ComboRosterName, string>> = {
  재키: "001.Jackie",
};

/** `001.Jackie` → `/images/character/default/001.Jackie/Jackie_Mini_00.png` */
export function defaultMiniPathFromAssetDir(assetDir: string): string {
  const dot = assetDir.indexOf(".");
  const english = dot >= 0 ? assetDir.slice(dot + 1) : assetDir;
  return `/images/character/default/${assetDir}/${english}_Mini_00.png`;
}

export function getCharacterDefaultMiniSrc(nameKo: string): string | null {
  const dir = COMBO_CHARACTER_DEFAULT_DIRS[nameKo as ComboRosterName];
  if (!dir) return null;
  return defaultMiniPathFromAssetDir(dir);
}
