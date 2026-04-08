# Weapon 코드/이미지 매핑 기준

전적 검색에서 무기 슬롯(`slot 0`)은 `equipment["0"]`보다 `bestWeapon`(WeaponTypeInfo 코드)을 기준으로 표시한다.

## 규칙

- `bestWeapon` 코드 → `weapon` 테이블 코드(id)와 동일 기준으로 해석
- 이름: `weapon` 테이블의 한글명 기준(`frontend/lib/weaponOptions.ts` 동기화)
- 이미지: `frontend/public/images/Item/01. Weapons/00. Weapon Group/*.png` 사용

## 코드 매핑

- 1 글러브 → `01. Glove.png`
- 2 톤파 → `02. Tonfa.png`
- 3 방망이 → `03. Bat.png`
- 4 망치 → `04. Hammer.png`
- 5 채찍 → `05. Whip.png`
- 6 투척 → `06. Throwing.png`
- 7 암기 → `07. Shuriken.png`
- 8 활 → `08. Bow.png`
- 9 석궁 → `09. Crossbow.png`
- 10 권총 → `10. Pistol.png`
- 11 돌격소총 → `11. Assault Rifle.png`
- 12 저격총 → `12. Sniper Rifle.png`
- 13 도끼 → `13. Axe.png`
- 14 단검 → `14. Dagger.png`
- 15 양손검 → `15. Twohanded Sword.png`
- 16 쌍검 → `16. Dual Sword.png`
- 17 창 → `17. Spear.png`
- 18 쌍절곤 → `18. Nunchaku.png`
- 19 레이피어 → `19. Rapier.png`
- 20 기타 → `20. Guitar.png`
- 21 카메라 → `21. Camera.png`
- 22 아르카나 → `22. Arcana.png`
- 23 VF 의수 → `23. VF Prosthetic.png`
- 24 아르카나(확장) → `22. Arcana.png`
- 25 VF 의수(확장) → `23. VF Prosthetic.png`

