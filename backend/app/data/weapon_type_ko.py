"""
전적 game_details.best_weapon / API bestWeapon 값은 WeaponTypeInfo 배열의 1-based 인덱스로 취급한다.

**무기 표시의 단일 기준 — Supabase `public.weapon`**
  - `id`   : best_weapon 코드 (1..25, WeaponTypeInfo 순서 + 24·25 확장)
  - `name` : 한글 표시명 (통계·UI는 이 값을 최우선)
  - `nameEn`: WeaponTypeInfo 의 `type` 영문 (같은 영문이 id 22·24 등에 중복될 수 있음 → 식별은 항상 `id`)

한글 우선순위(통계 등):
1) DB `weapon.name` (행이 있는 코드)
2) 없는 코드만 `load_best_weapon_code_to_ko` (API/아래 폴백 리스트)

`WEAPON_TYPE_KO_LABELS_ORDER[i]` 는 **DB에서 id = i+1 인 행의 `name`** 과 맞춘 오프라인 스냅샷이다.
DB 내용을 바꾼 뒤에는 이 리스트·`sync_weapon_display_ko.py`·`frontend/lib/weaponOptions.ts` 라벨을 같이 맞출 것.
"""

from __future__ import annotations

# API가 실패할 때 사용하는 WeaponTypeInfo 기본 순서 (v2 응답과 동일해야 함)
WEAPON_TYPE_INFO_ORDER_EN: list[str] = [
    "Glove",
    "Tonfa",
    "Bat",
    "Hammer",
    "Whip",
    "HighAngleFire",
    "DirectFire",
    "Bow",
    "CrossBow",
    "Pistol",
    "AssaultRifle",
    "SniperRifle",
    "Axe",
    "OneHandSword",
    "TwoHandSword",
    "DualSword",
    "Spear",
    "Nunchaku",
    "Rapier",
    "Guitar",
    "Camera",
    "Arcana",
    "VFArm",
]

# id 1..23 의 public.weapon.name 과 동일 순서 (DB 비었을 때만 사용). Supabase와 불일치 시 DB 우선.
WEAPON_TYPE_KO_LABELS_ORDER: list[str] = [
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
]

assert len(WEAPON_TYPE_KO_LABELS_ORDER) == len(WEAPON_TYPE_INFO_ORDER_EN), (
    "WEAPON_TYPE_KO_LABELS_ORDER 와 WEAPON_TYPE_INFO_ORDER_EN 길이가 같아야 함"
)


def weapon_type_en_to_ko_label(en: str) -> str:
    """영문 type 문자열 → 위 순서와 동일 인덱스의 한글. 알 수 없으면 en 그대로."""
    try:
        idx = WEAPON_TYPE_INFO_ORDER_EN.index(en)
    except ValueError:
        return en
    if 0 <= idx < len(WEAPON_TYPE_KO_LABELS_ORDER):
        return WEAPON_TYPE_KO_LABELS_ORDER[idx]
    return en

# WeaponTypeInfo 23종 밖의 best_weapon 코드 (로그에만 등장하는 경우)
EXTRA_BEST_WEAPON_CODE_TO_KO: dict[int, str] = {
    24: "아르카나",
    25: "VF 의수",
}


# 통계 UI: best_weapon 코드는 WeaponTypeInfo 공통이나, 게임 내 통칭은 실험체별로 다름
CHARACTER_WEAPON_NAME_OVERRIDE: dict[tuple[int, int], str] = {
    (17, 5): "단검",  # 쇼이치 · Whip
    (5, 5): "레이피어",  # 피오라 · Whip
    (15, 5): "레이피어",  # 키아라 · Whip
    (18, 15): "권총",  # 실비아 · TwoHandSword
}


def resolve_weapon_display_name_for_stats(
    character_num: int, weapon_id: int, weapon_code_to_ko: dict[int, str]
) -> str:
    """캐릭터+무기 코드 조합별 한글 라벨(통계 행). 알렉스 병합(weapon_id=0)은 호출부에서 처리."""
    o = CHARACTER_WEAPON_NAME_OVERRIDE.get((character_num, weapon_id))
    if o:
        return o
    return weapon_code_to_ko.get(weapon_id) or f"무기 #{weapon_id}"


def build_code_to_ko_map(ordered_types: list[str]) -> dict[int, str]:
    """best_weapon 정수(1..N) → 한글. 각 슬롯의 type(en)으로 canonical 인덱스에서 한글을 고른다."""
    out: dict[int, str] = {}
    for i, en in enumerate(ordered_types):
        code = i + 1
        out[code] = weapon_type_en_to_ko_label(en)
    out.update(EXTRA_BEST_WEAPON_CODE_TO_KO)
    return out


def load_best_weapon_code_to_ko(base_url: str, api_key: str) -> dict[int, str]:
    """
    /v2/data/WeaponTypeInfo 순서를 기준으로 best_weapon(1-based) → 한글명 맵 생성.
    API 실패 시 정적 순서(WEAPON_TYPE_INFO_ORDER_EN) 사용.

    통계/UI에서는 `build_best_weapon_code_to_ko_db_first`로 Supabase weapon 테이블을 우선하는 것을 권장한다.
    """
    import httpx

    if not api_key:
        return build_code_to_ko_map(WEAPON_TYPE_INFO_ORDER_EN)
    try:
        url = f"{base_url.rstrip('/')}/v2/data/WeaponTypeInfo"
        resp = httpx.get(
            url,
            params={"locale": "ko"},
            headers={"x-api-key": api_key, "accept": "application/json"},
            timeout=30.0,
        )
        resp.raise_for_status()
        payload = resp.json()
        data = payload.get("data")
        if not isinstance(data, list) or not data:
            return build_code_to_ko_map(WEAPON_TYPE_INFO_ORDER_EN)
        order = [str(row.get("type") or "") for row in data if isinstance(row, dict)]
        order = [x for x in order if x]
        if len(order) < 10:
            return build_code_to_ko_map(WEAPON_TYPE_INFO_ORDER_EN)
        return build_code_to_ko_map(order)
    except Exception:
        return build_code_to_ko_map(WEAPON_TYPE_INFO_ORDER_EN)


def _weapon_row_get(row: dict, *keys: str) -> object | None:
    for k in keys:
        if k in row and row[k] is not None:
            return row[k]
    return None


def weapon_code_to_ko_map_from_db_rows(rows: list[dict]) -> dict[int, str]:
    """
    Supabase `weapon` 조회 결과 → best_weapon 코드 → 한글.

    컬럼: `id`, `name`(필수), `nameEn` / `name_en`(선택, 매핑 검증용).
    """
    out: dict[int, str] = {}
    for r in rows:
        if not isinstance(r, dict):
            continue
        raw_id = _weapon_row_get(r, "id")
        if raw_id is None:
            continue
        try:
            wid = int(raw_id)
        except (TypeError, ValueError):
            continue
        name = _weapon_row_get(r, "name")
        if name is None:
            continue
        lab = str(name).strip()
        if lab:
            out[wid] = lab
    return out


def build_best_weapon_code_to_ko_db_first(
    db_map: dict[int, str],
    base_url: str,
    api_key: str,
) -> dict[int, str]:
    """
    무기 코드→한글: **DB(weapon.name) 우선**, 테이블에 없거나 빈 코드만 API/정적 맵으로 보충.
    """
    fallback = load_best_weapon_code_to_ko(base_url, api_key)
    out: dict[int, str] = {}
    for k, v in db_map.items():
        if v and str(v).strip():
            out[int(k)] = str(v).strip()
    for k, v in fallback.items():
        if k not in out:
            out[k] = v
    return out
