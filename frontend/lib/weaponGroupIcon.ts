/**
 * `public/images/Item/01. Weapons/00. Weapon Group/` 아이콘
 * 파일명: `NN. {Stem}.png` — NN은 best_weapon(1..23) 코드, WeaponTypeInfo 순서와 동일.
 * 코드 24·25는 게임 내 확장으로 22·23과 동일 아이콘을 사용.
 */

const CANONICAL_CODE_MAX = 23;

/** WeaponTypeInfo 순서( backend/app/data/weapon_type_ko.WEAPON_TYPE_INFO_ORDER_EN )에 대응하는 파일 Stem */
const WEAPON_GROUP_STEMS: readonly string[] = [
  "Glove",
  "Tonfa",
  "Bat",
  "Hammer",
  "Whip",
  "Throw",
  "Shuriken",
  "Bow",
  "Crossbow",
  "Pistol",
  "Assault Rifle",
  "Sniper Rifle",
  "Axe",
  "Dagger",
  "Two-handed Sword",
  "Dual Swords",
  "Spear",
  "Nunchaku",
  "Rapier",
  "Guitar",
  "Camera",
  "Arcana",
  "VF Prosthetic",
];

export function canonicalBestWeaponCodeForIcon(weaponCode: number): number {
  if (weaponCode === 24) return 22;
  if (weaponCode === 25) return 23;
  return weaponCode;
}

/**
 * Next/Image·img src용 경로 (공백 포함 → encodeURI 권장)
 */
export function getWeaponGroupIconPath(weaponCode: number): string | null {
  const c = canonicalBestWeaponCodeForIcon(weaponCode);
  if (!Number.isFinite(c) || c < 1 || c > CANONICAL_CODE_MAX) return null;
  const stem = WEAPON_GROUP_STEMS[c - 1];
  if (!stem) return null;
  const nn = String(c).padStart(2, "0");
  return `/images/Item/01. Weapons/00. Weapon Group/${nn}. ${stem}.png`;
}

export function getWeaponGroupIconSrcEncoded(weaponCode: number): string | null {
  const raw = getWeaponGroupIconPath(weaponCode);
  return raw ? encodeURI(raw) : null;
}
