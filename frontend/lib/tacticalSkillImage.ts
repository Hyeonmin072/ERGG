/**
 * 전술 스킬 그룹(tacticalSkillGroup) → 한글 표시명·이미지 파일명
 * DB `tactical_skill_group` 시드와 동기화. 이미지는 `public/images/tacticalSkill/{파일명}` 존재 시만 연결.
 */

const DIR = "/images/tacticalSkill";

/** tacticalSkillGroup 코드 → 한국어 이름 (tactical_skill_group.name_kr) */
export const TACTICAL_SKILL_NAME_KR: Record<number, string> = {
  30: "블링크",
  40: "퀘이크",
  50: "프로토콜 위반",
  60: "붉은 폭풍",
  70: "초월",
  80: "아티팩트",
  90: "무효화",
  110: "강한 결속",
  120: "스트라이더 - A13",
  130: "진실의 칼날",
  140: "거짓 서약",
  150: "치유의 바람",
  500010: "블레싱: 명상",
  500020: "중력장",
  500030: "롤링썬더",
  500040: "폭진",
  500050: "블링크",
  500060: "기원",
  500070: "대지분쇄",
  500080: "힘껏 펀치",
  500090: "메테오",
  500100: "라이트닝 쉴드",
  500110: "블레싱: 명상",
  500120: "블링크",
  500130: "퀘이크",
  500140: "프로토콜 위반",
  500150: "붉은 폭풍",
  500160: "초월",
  500170: "아티팩트",
  500180: "무효화",
  500190: "강한 결속",
  500200: "스트라이더 - A13",
  500210: "진실의 칼날",
  500220: "거짓 서약",
  500230: "치유의 바람",
  500240: "부착",
  1000000: "하이퍼루프",
};

/**
 * 한글 이름과 동일한 파일명이 repo에 있을 때만 `.webp` 경로 반환.
 * (폴더에 없는 스킬은 null → UI에서 숫자 폴백)
 */
const NAME_KR_TO_FILE = new Map<string, string>([
  ["블링크", "블링크.webp"],
  ["퀘이크", "퀘이크.webp"],
  ["프로토콜 위반", "프로토콜 위반.webp"],
  ["붉은 폭풍", "붉은 폭풍.webp"],
  ["초월", "초월.webp"],
  ["아티팩트", "아티팩트.webp"],
  ["무효화", "무효화.webp"],
  ["강한 결속", "강한 결속.webp"],
  ["스트라이더 - A13", "스트라이더 - A13.webp"],
  ["진실의 칼날", "진실의 칼날.webp"],
  ["거짓 서약", "거짓 서약.webp"],
  ["치유의 바람", "치유의 바람.webp"],
]);

export function getTacticalSkillNameKr(group: number): string | undefined {
  return TACTICAL_SKILL_NAME_KR[group];
}

/** public 폴더 기준 경로 또는 이미지 없음 */
export function getTacticalSkillImagePath(tacticalSkillGroup: number): string | null {
  const nameKr = TACTICAL_SKILL_NAME_KR[tacticalSkillGroup];
  if (!nameKr) return null;
  const file = NAME_KR_TO_FILE.get(nameKr);
  if (!file) return null;
  return `${DIR}/${file}`;
}
