import { BEST_WEAPON_OPTIONS } from "@/lib/weaponOptions";

export interface WeaponReferenceRow {
  code: number;
  name: string;
  imagePath: string | null;
}

const GROUP_ICON_BY_CODE: Record<number, string> = {
  1: "/images/Item/01. Weapons/00. Weapon Group/01. Glove.png",
  2: "/images/Item/01. Weapons/00. Weapon Group/02. Tonfa.png",
  3: "/images/Item/01. Weapons/00. Weapon Group/03. Bat.png",
  4: "/images/Item/01. Weapons/00. Weapon Group/04. Hammer.png",
  5: "/images/Item/01. Weapons/00. Weapon Group/05. Whip.png",
  6: "/images/Item/01. Weapons/00. Weapon Group/06. Throwing.png",
  7: "/images/Item/01. Weapons/00. Weapon Group/07. Shuriken.png",
  8: "/images/Item/01. Weapons/00. Weapon Group/08. Bow.png",
  9: "/images/Item/01. Weapons/00. Weapon Group/09. Crossbow.png",
  10: "/images/Item/01. Weapons/00. Weapon Group/10. Pistol.png",
  11: "/images/Item/01. Weapons/00. Weapon Group/11. Assault Rifle.png",
  12: "/images/Item/01. Weapons/00. Weapon Group/12. Sniper Rifle.png",
  13: "/images/Item/01. Weapons/00. Weapon Group/13. Axe.png",
  14: "/images/Item/01. Weapons/00. Weapon Group/14. Dagger.png",
  15: "/images/Item/01. Weapons/00. Weapon Group/15. Twohanded Sword.png",
  16: "/images/Item/01. Weapons/00. Weapon Group/16. Dual Sword.png",
  17: "/images/Item/01. Weapons/00. Weapon Group/17. Spear.png",
  18: "/images/Item/01. Weapons/00. Weapon Group/18. Nunchaku.png",
  19: "/images/Item/01. Weapons/00. Weapon Group/19. Rapier.png",
  20: "/images/Item/01. Weapons/00. Weapon Group/20. Guitar.png",
  21: "/images/Item/01. Weapons/00. Weapon Group/21. Camera.png",
  22: "/images/Item/01. Weapons/00. Weapon Group/22. Arcana.png",
  23: "/images/Item/01. Weapons/00. Weapon Group/23. VF Prosthetic.png",
  24: "/images/Item/01. Weapons/00. Weapon Group/22. Arcana.png",
  25: "/images/Item/01. Weapons/00. Weapon Group/23. VF Prosthetic.png",
};

export const WEAPON_REFERENCE: WeaponReferenceRow[] = BEST_WEAPON_OPTIONS.map((w) => ({
  code: w.code,
  name: w.labelKo,
  imagePath: GROUP_ICON_BY_CODE[w.code] ?? null,
}));

const WEAPON_BY_CODE = new Map(WEAPON_REFERENCE.map((w) => [w.code, w]));

export function getWeaponReference(code: number): WeaponReferenceRow | null {
  return WEAPON_BY_CODE.get(code) ?? null;
}

