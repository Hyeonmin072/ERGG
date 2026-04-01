"""
전적 game_details.best_weapon / API bestWeapon 값은 WeaponTypeInfo 배열의 1-based 인덱스로 취급한다.
(공식 /v2/data/WeaponTypeInfo 와 동일한 순서)

영문 type 문자열 → 한글 표시명 (게임 내 통칭에 맞춤)
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

# 사용자 지정 표시명(게임 무기 타입 코드 순서와 별도로, 통계/UI용 라벨)
WEAPON_TYPE_EN_TO_KO: dict[str, str] = {
    "Glove": "글러브",
    "Tonfa": "톤파",
    "Bat": "방망이",
    "Hammer": "채찍",
    "Whip": "투척",
    "HighAngleFire": "암기",
    "DirectFire": "활",
    "Bow": "석궁",
    "CrossBow": "권총",
    "Pistol": "돌격소총",
    "AssaultRifle": "저격총",
    "SniperRifle": "저격총",
    "Axe": "망치",
    "OneHandSword": "도끼",
    "TwoHandSword": "단검",
    "DualSword": "양손검",
    "Spear": "창",
    "Nunchaku": "쌍검",
    "Rapier": "창",
    "Guitar": "쌍절곤",
    "Camera": "레이피어",
    "Arcana": "기타",
    "VFArm": "카메라",
}

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
    """best_weapon 정수(1..N) → 한글 무기 타입명."""
    out: dict[int, str] = {}
    for i, en in enumerate(ordered_types):
        code = i + 1
        out[code] = WEAPON_TYPE_EN_TO_KO.get(en, en)
    out.update(EXTRA_BEST_WEAPON_CODE_TO_KO)
    return out


def load_best_weapon_code_to_ko(base_url: str, api_key: str) -> dict[int, str]:
    """
    /v2/data/WeaponTypeInfo 순서를 기준으로 best_weapon(1-based) → 한글명 맵 생성.
    API 실패 시 정적 순서(WEAPON_TYPE_INFO_ORDER_EN) 사용.
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
