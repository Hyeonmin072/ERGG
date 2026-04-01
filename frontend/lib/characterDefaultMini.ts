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
  쇼우: "013.Xiukai",
  시셀라: "014.Sissela",
  키아라: "015.Chiara",
  아드리아나: "016.Adriana",
  쇼이치: "017.Shoichi",
  실비아: "018.Silvia",
  엠마: "019.Emma",
  레녹스: "020.Lenox",
  로지: "021.Rozzi",
  루크: "022.Luke",
  캐시: "023.Cathy",
  아델라: "024.Adela",
  버니스: "025.bERnice",
  바바라: "026.Barbara",
  알렉스: "027.Alex",
  수아: "028.Sua",
  레온: "029.Leon",
  일레븐: "030.Eleven",
  리오: "031.Rio",
  윌리엄: "032.William",
  니키: "033.Nicky",
  나타폰: "034.Nathapon",
  얀: "035.Jan",
  이바: "036.Eva",
  다니엘: "037.Daniel",
  제니: "038.Jenny",
  카밀로: "039.Camilo",
  클로에: "040.Chloe",
  요한: "041.Johann",
  비앙카: "042.Bianca",
  셀린: "043.Celine",
  에키온: "044.Echion",
  마이: "045.Mai",
  에이든: "046.Aiden",
  라우라: "047.Laura",
  띠아: "048.Tia",
  펠릭스: "049.Felix",
  엘레나: "050.Elena",
  프리야: "051.Priya",
  아디나: "052.Adina",
  마커스: "053.Markus",
  칼라: "054.Karla",
  에스텔: "055.Estelle",
  피올로: "056.Piolo",
  마르티나: "057.Martina",
  헤이즈: "058.Haze",
  아이작: "059.Issac",
  타지아: "060.Tazia",
  이렘: "061.Irem",
  테오도르: "062.Theodore",
  이안: "063.Ly anh",
  바냐: "064.Vanya",
  "데비&마를렌": "065.Debi & Marlene",
  아르다: "066.Arda",
  아비게일: "067.Abigail",
  알론소: "068.Alonso",
  레니: "069.Leni",
  츠바메: "070.Tsubame",
  케네스: "071.Kennethe",
  카티야: "072.Katja",
  샬럿: "073.Charlotte",
  다르코: "074.Darko",
  르노어: "075.Lenore",
  가넷: "076.Garnet",
  유민: "077.Yumin",
  히스이: "078.Hisui",
  유스티나: "079.Justyna",
  이슈트반: "080.Istvan",
  니아: "081.NiaH",
  슈린: "082.Xuelin",
  헨리: "083.Henry",
  블레어: "084.Blair",
  미르카: "085.Mirka",
  펜리르: "086.Fenrir",
  코렐라인: "087.Coraline",
};

/**
 * 폴더 접미사와 실제 파일명이 다른 경우만 지정.
 * 기본 규칙: `{폴더명 점 뒤 영문}_Mini_00.png`
 */
const MINI_FILENAME_OVERRIDES: Partial<Record<ComboRosterName, string>> = {
  현우: "Hyunwoo_Mini_00.png",
  매그너스: "Mini_Magnus_00.png",
  아이솔: "Isol_Mini_00.png",
  펠릭스: "Default_Mini.png",
  아이작: "Isaac_Mini_00.png",
  "데비&마를렌": "DebiMarlene_Mini_00.png",
  케네스: "Kenneth_Mini_00.png",
  유민: "Mini_YuMin_00.png",
  히스이: "Mini_Hisui_00.png",
  유스티나: "Mini_Justyna_00.png",
  이슈트반: "Mini_Istvan_00.png",
  니아: "Mini_NiaH_00.png",
  슈린: "Mini_Xuelin_00.png",
  헨리: "Mini_Henry_00.png",
  블레어: "Mini_Blair_00.png",
  펜리르: "Mini_Fenrir_00.png",
  코렐라인: "Mini_Coraline_00.png",
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
