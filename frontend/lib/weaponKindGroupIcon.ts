/**
 * item.kind(ER ItemWeapon weaponType 등) → 00. Weapon Group 아이콘 경로.
 * DB `item.kind` 문자열과 동기화 (sync_item_master `_weapon_kind_from_row`).
 */
const G = "/images/Item/01. Weapons/00. Weapon Group";

/** kind 문자열 → Weapon Group PNG (파일명은 public 폴더 실제 파일과 일치) */
const WEAPON_KIND_TO_GROUP_PATH: Record<string, string> = {
  Glove: `${G}/01. Glove.png`,
  Tonfa: `${G}/02. Tonfa.png`,
  Bat: `${G}/03. Bat.png`,
  Hammer: `${G}/04. Hammer.png`,
  Whip: `${G}/05. Whip.png`,
  HighAngleFire: `${G}/06. Throwing.png`,
  DirectFire: `${G}/07. Shuriken.png`,
  Bow: `${G}/08. Bow.png`,
  CrossBow: `${G}/09. Crossbow.png`,
  Pistol: `${G}/10. Pistol.png`,
  AssaultRifle: `${G}/11. Assault Rifle.png`,
  SniperRifle: `${G}/12. Sniper Rifle.png`,
  Axe: `${G}/13. Axe.png`,
  OneHandSword: `${G}/14. Dagger.png`,
  TwoHandSword: `${G}/15. Twohanded Sword.png`,
  DualSword: `${G}/16. Dual Sword.png`,
  Spear: `${G}/17. Spear.png`,
  Nunchaku: `${G}/18. Nunchaku.png`,
  Rapier: `${G}/19. Rapier.png`,
  Guitar: `${G}/20. Guitar.png`,
  Camera: `${G}/21. Camera.png`,
  Arcana: `${G}/22. Arcana.png`,
  VFArm: `${G}/23. VF Prosthetic.png`,
};

export function getWeaponGroupIconPathFromItemKind(kind: string | null | undefined): string | null {
  if (kind == null || typeof kind !== "string") return null;
  const k = kind.trim();
  if (!k) return null;
  return WEAPON_KIND_TO_GROUP_PATH[k] ?? null;
}
