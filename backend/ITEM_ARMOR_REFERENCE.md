# Eternal Return `ItemArmor` 정리

- Endpoint: `https://open-api.bser.io/v2/data/ItemArmor`
- Query: `locale=ko`
- 인증: `x-api-key` 필요 (미인증 시 `{"message":"Forbidden"}`)
- 기준 데이터: 249개 아이템 (실조회 기준)

## 1) 바로 쓰기 좋은 핵심 컬럼

- `code`: 아이템 코드 (고유 ID)
- `name`: 아이템 이름 (locale=ko면 한글명)
- `armorType`: 장비 부위
  - `Head`, `Chest`, `Arm`, `Leg`
- `itemGrade`: 등급
  - `Common`, `Uncommon`, `Rare`, `Epic`, `Legend`, `Mythic`
- `isCompletedItem`: 완성 아이템 여부
- `makeMaterial1`, `makeMaterial2`: 제작 재료 코드
- `manufacturableType`: 제작 가능 타입 (초기 제작 가능 아이템 판별에 유용)
- `modeType`: 모드 제한 (대부분 0)
- `exchange`: 상점/교환 관련 값

## 2) 분류 통계 (실조회)

### 부위(`armorType`)

- `Head`: 71
- `Chest`: 66
- `Arm`: 67
- `Leg`: 45

### 등급(`itemGrade`)

- `Legend`: 106
- `Epic`: 68
- `Uncommon`: 21
- `Mythic`: 20
- `Common`: 17
- `Rare`: 17

### 기타

- `isCompletedItem=true`: 194
- `isCompletedItem=false`: 55
- `manufacturableType=1`: 15
- `modeType != 0`: 1 (`201517`, `천상의메아리-C`, `modeType=4`)

## 3) 스탯 컬럼 중 활용도 높은 것

아래는 값이 0이 아닌 아이템이 실제로 존재하는 필드들:

- `attackPower` (70)
- `defense` (124)
- `skillAmp` (66)
- `adaptiveForce` (7)
- `maxHp` (40)
- `criticalStrikeChance` (23)
- `criticalStrikeDamage` (2)
- `cooldownReduction` (111)
- `lifeSteal` (4), `normalLifeSteal` (3)
- `moveSpeed` (45)

## 4) `manufacturableType=1` 아이템 코드/이름

- `201101` 머리띠
- `201102` 모자
- `201104` 자전거헬멧
- `201201` 가면
- `202101` 바람막이
- `202106` 셔츠
- `202103` 승복
- `202105` 전신수영복
- `203101` 손목시계
- `203102` 붕대
- `203104` 팔찌
- `204102` 운동화
- `204103` 타이즈
- `204101` 슬리퍼
- `204205` 나막신

## 5) 코드/이름 전체 목록 뽑는 스크립트 (Markdown 표 출력)

아래 명령을 실행하면 `code | name | armorType | itemGrade | isCompletedItem` 기준으로 전체 249개를 Markdown 표로 출력할 수 있음.

```bash
python3 - <<'PY'
import os, httpx
from pathlib import Path

env_path = Path("backend/.env")
for line in env_path.read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    k, v = line.split("=", 1)
    os.environ.setdefault(k, v)

headers = {"accept": "application/json", "x-api-key": os.getenv("ER_API_KEY", "").strip()}
resp = httpx.get(
    "https://open-api.bser.io/v2/data/ItemArmor",
    params={"locale": "ko"},
    headers=headers,
    timeout=30.0,
)
resp.raise_for_status()
rows = resp.json()["data"]

print("| code | name | armorType | itemGrade | isCompletedItem |")
print("|---:|---|---|---|:---:|")
for r in sorted(rows, key=lambda x: x["code"]):
    print(f"| {r.get('code')} | {r.get('name')} | {r.get('armorType')} | {r.get('itemGrade')} | {r.get('isCompletedItem')} |")
PY
```

## 6) 프론트 매핑 산출물

전적 검색(상세 모달)의 장비 표시는 아래 매핑 파일을 사용:

- `frontend/lib/data/itemArmorReference.ts`
  - `code`, `name`, `armorType`, `itemGrade`, `imagePath` 포함
  - 이미지 경로는 `frontend/public/images/Item` 기준

주의:

- ER `equipment`의 `slot 0`(무기)은 `ItemArmor` 대상이 아니므로, 현재 매핑은 방어구(머리/옷/팔/다리) 중심.

