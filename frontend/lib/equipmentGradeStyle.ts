/**
 * ER equipmentGrade 숫자(3~6)에 따른 장비 칸 배경 그라데이션.
 * 3 파랑 · 4 보라 · 5 노랑 · 6 빨강
 */
const WHITE_SLOT =
  "linear-gradient(160deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0.12) 100%)";

export function getEquipmentGradeBackground(grade: number | undefined | null): string {
  if (grade == null || !Number.isFinite(grade)) {
    return WHITE_SLOT;
  }
  const g = Math.floor(Number(grade));
  switch (g) {
    case 3:
      return "linear-gradient(145deg, rgba(96,165,250,0.72) 0%, rgba(59,130,246,0.5) 45%, rgba(30,64,175,0.38) 100%)";
    case 4:
      return "linear-gradient(145deg, rgba(192,132,252,0.75) 0%, rgba(147,51,234,0.52) 45%, rgba(88,28,135,0.42) 100%)";
    case 5:
      return "linear-gradient(145deg, rgba(253,224,71,0.88) 0%, rgba(250,204,21,0.58) 45%, rgba(180,83,9,0.48) 100%)";
    case 6:
      return "linear-gradient(145deg, rgba(248,113,113,0.88) 0%, rgba(239,68,68,0.62) 45%, rgba(127,29,29,0.52) 100%)";
    default:
      return WHITE_SLOT;
  }
}
