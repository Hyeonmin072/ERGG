/**
 * 조합 승률 예측 화면에서 선택 가능한 실험체 목록 (게임 내 표기 기준).
 * @see text (프로젝트 루트)
 */
export const COMBO_ROSTER_NAMES = [
  "재키",
  "아야",
  "현우",
  "매그너스",
  "피오라",
  "나딘",
  "하트",
  "자히르",
  "아이솔",
  "리 다이린",
  "유키",
  "혜진",
  "쇼우",
  "시셀라",
  "키아라",
  "아드리아나",
  "쇼이치",
  "실비아",
  "엠마",
  "레녹스",
  "로지",
  "루크",
  "캐시",
  "아델라",
  "버니스",
  "바바라",
  "알렉스",
  "수아",
  "레온",
  "일레븐",
  "리오",
  "윌리엄",
  "니키",
  "나타폰",
  "얀",
  "이바",
  "다니엘",
  "제니",
  "카밀로",
  "클로에",
  "요한",
  "비앙카",
  "셀린",
  "에키온",
  "마이",
  "에이든",
  "라우라",
  "띠아",
  "펠릭스",
  "엘레나",
  "프리야",
  "아디나",
  "마커스",
  "칼라",
  "에스텔",
  "피올로",
  "마르티나",
  "헤이즈",
  "아이작",
  "타지아",
  "이렘",
  "테오도르",
  "이안",
  "바냐",
  "데비&마를렌",
  "아르다",
  "아비게일",
  "알론소",
  "레니",
  "츠바메",
  "케네스",
  "카티야",
  "샬럿",
  "다르코",
  "르노어",
  "가넷",
  "유민",
  "히스이",
  "유스티나",
  "이슈트반",
  "니아",
  "슈린",
  "헨리",
  "블레어",
  "미르카",
  "펜리르",
  "코렐라인",
] as const;

export type ComboRosterName = (typeof COMBO_ROSTER_NAMES)[number];

export function filterComboRoster(query: string): string[] {
  const q = query.trim();
  if (!q) return [...COMBO_ROSTER_NAMES];
  return COMBO_ROSTER_NAMES.filter((name) => name.includes(q));
}

/** 백엔드 연동 전: 조합 문자열 기반 결정적 데모 승률 (42~58% 구간) */
export function mockComboWinRatePercent(names: [string, string, string]): number {
  const key = [...names].sort().join("\0");
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u = Math.abs(h) % 10000;
  return Math.round((42 + (u / 10000) * 16) * 10) / 10;
}
