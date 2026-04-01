import type { ComboRosterName } from "./comboRoster";

/**
 * 한글 실험체 표기 → `public/images/character/default/` 폴더명 (예: 001.Jackie)
 * 게임 내 순서와 폴더 번호가 다를 수 있어 이름 기준으로만 연결합니다.
 */
export const COMBO_CHARACTER_DEFAULT_DIRS: Partial<Record<ComboRosterName, string>> = {
  재키: "001.Jackie",
  아야: "002.Aya",
  현우: "003.Hyeonwoo",
  매그너스: "004.Magnus",
  피오라: "005.Fiora",
  나딘: "006.Nadine",
  자히르: "007.Zahir",
  하트: "008.Hart",
  아이솔: "009.isol",
  "리 다이린": "010.Li Dailin",
  유키: "011.Yuki",
  혜진: "012.Hyejin",
};

/**
 * 폴더 접미사와 실제 파일명이 다른 경우만 지정.
 * 기본 규칙: `{폴더명 점 뒤 영문}_Mini_00.png`
 */
const MINI_FILENAME_OVERRIDES: Partial<Record<ComboRosterName, string>> = {
  현우: "Hyunwoo_Mini_00.png",
  매그너스: "Mini_Magnus_00.png",
  아이솔: "Isol_Mini_00.png",
};

function defaultMiniFilenameFromDir(assetDir: string): string {
  const dot = assetDir.indexOf(".");
  const english = dot >= 0 ? assetDir.slice(dot + 1) : assetDir;
  return `${english}_Mini_00.png`;
}

/** public URL (공백·특수문자 대응 인코딩) */
export function getCharacterAssetMiniUrl(
  assetDir: string,
  koName: ComboRosterName
): string {
  const file =
    MINI_FILENAME_OVERRIDES[koName] ?? defaultMiniFilenameFromDir(assetDir);
  const encDir = encodeURIComponent(assetDir);
  const encFile = encodeURIComponent(file);
  return `/images/character/default/${encDir}/${encFile}`;
}

/** @deprecated 내부용 — `getCharacterAssetMiniUrl` 사용 권장 */
export function defaultMiniPathFromAssetDir(assetDir: string): string {
  const dot = assetDir.indexOf(".");
  const english = dot >= 0 ? assetDir.slice(dot + 1) : assetDir;
  return `/images/character/default/${encodeURIComponent(assetDir)}/${encodeURIComponent(`${english}_Mini_00.png`)}`;
}

export function getCharacterDefaultMiniSrc(nameKo: string): string | null {
  const dir = COMBO_CHARACTER_DEFAULT_DIRS[nameKo as ComboRosterName];
  if (!dir) return null;
  return getCharacterAssetMiniUrl(dir, nameKo as ComboRosterName);
}
