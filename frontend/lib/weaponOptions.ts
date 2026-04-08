/**
 * game_details.bestWeapon / ER WeaponTypeInfo 1-based 인덱스.
 * 한글 라벨은 Supabase `public.weapon.name`(id 동일)과 맞출 것 — DB가 단일 기준.
 */
export interface WeaponOption {
  code: number;
  labelKo: string;
}

/** id 1..23 = public.weapon.name (DB와 동일 순서) */
const BASE_LABELS: string[] = [
  "글러브",
  "톤파",
  "방망이",
  "망치",
  "채찍",
  "투척",
  "암기",
  "활",
  "석궁",
  "권총",
  "돌격소총",
  "저격총",
  "도끼",
  "단검",
  "양손검",
  "쌍검",
  "창",
  "쌍절곤",
  "레이피어",
  "기타",
  "카메라",
  "아르카나",
  "VF 의수",
];

export const BEST_WEAPON_OPTIONS: WeaponOption[] = BASE_LABELS.map((labelKo, i) => ({
  code: i + 1,
  labelKo,
}));

BEST_WEAPON_OPTIONS.push(
  { code: 24, labelKo: "아르카나" },
  { code: 25, labelKo: "VF 의수" }
);

/** 캐릭터별로 허용 무기만 쓰려면 여기에 characterNum → code[] 추가. 없으면 전체 목록. */
const ALLOWED_BY_CHARACTER = new Map<number, number[]>();
// 예: ALLOWED_BY_CHARACTER.set(5, [1, 2, 3]);

export function getWeaponOptionsForCharacter(characterNum: number): WeaponOption[] {
  const allowed = ALLOWED_BY_CHARACTER.get(characterNum);
  if (!allowed?.length) return BEST_WEAPON_OPTIONS;
  const set = new Set(allowed);
  return BEST_WEAPON_OPTIONS.filter((o) => set.has(o.code));
}
