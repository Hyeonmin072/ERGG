"""
/v2/data/Character 데이터를 기준으로 character 테이블을 정리/동기화한다.

요구 반영:
- 이름은 가능한 한국어 우선 저장(name)
- battleType은 NULL로 저장
- 추가 가능한 컬럼(nameKo, nameEn, weaponCode, sourcePayload)도 함께 저장

실행:
  python3 backend/sync_characters_from_v2.py
"""

from __future__ import annotations

import os
from typing import Any
from pathlib import Path

import httpx
from dotenv import load_dotenv
from supabase import create_client


BASE_URL = "https://open-api.bser.io"
ENDPOINT = "/v2/data/Character"


def _pick(d: dict[str, Any], keys: list[str], default: Any = None) -> Any:
    for k in keys:
        if k in d and d[k] is not None:
            return d[k]
    return default


def _extract_rows(payload: Any) -> list[dict[str, Any]]:
    # 응답 포맷이 문서/버전에 따라 다를 수 있으므로 유연하게 처리
    if isinstance(payload, list):
        return [x for x in payload if isinstance(x, dict)]
    if not isinstance(payload, dict):
        return []
    for key in ("data", "result", "characters", "Character"):
        v = payload.get(key)
        if isinstance(v, list):
            return [x for x in v if isinstance(x, dict)]
    return []


def fetch_characters(api_key: str) -> list[dict[str, Any]]:
    headers = {"accept": "application/json"}
    if api_key:
        headers["x-api-key"] = api_key

    with httpx.Client(timeout=30) as client:
        # 1) 키 포함 시도
        resp = client.get(f"{BASE_URL}{ENDPOINT}", headers=headers, params={"locale": "ko"})
        if resp.status_code == 200:
            return _extract_rows(resp.json())

        # 2) 키 없이 재시도(데이터 API가 공개인 경우 대비)
        resp2 = client.get(
            f"{BASE_URL}{ENDPOINT}",
            headers={"accept": "application/json"},
            params={"locale": "ko"},
        )
        if resp2.status_code == 200:
            return _extract_rows(resp2.json())

        raise RuntimeError(f"Character 데이터 조회 실패: {resp.status_code} / {resp2.status_code}")


def map_row(src: dict[str, Any]) -> dict[str, Any]:
    character_num = _pick(
        src,
        ["characterNum", "CharacterNum", "code", "id", "characterCode"],
    )
    if character_num is None:
        return {}

    name_ko = _pick(src, ["nameKr", "nameKR", "NameKr", "NameKR", "koreanName", "name_ko"])
    name_en = _pick(src, ["nameEn", "nameEN", "NameEn", "NameEN", "englishName", "name_en"])
    name_default = _pick(src, ["name", "Name"], f"Character {character_num}")
    weapon_code = _pick(src, ["weaponType", "WeaponType", "weaponCode", "weapon"])

    # 요청사항: 이름은 한국어 우선
    name = name_ko or name_default

    resolved_weapon = int(weapon_code) if weapon_code is not None else 0

    return {
        "characterNum": int(character_num),
        "name": str(name),
        "nameKo": str(name_ko) if name_ko else None,
        "nameEn": str(name_en) if name_en else None,
        "weaponType": resolved_weapon,
        "weaponCode": resolved_weapon if weapon_code is not None else None,
        "battleType": None,  # 요청사항: 일단 NULL 고정
        "sourcePayload": src,
    }


def main() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(env_path)

    api_key = os.getenv("ER_API_KEY", "").strip()
    supabase_url = os.getenv("SUPABASE_URL", "").strip() or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not supabase_url or not service_key:
        raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 설정이 필요합니다.")

    rows = fetch_characters(api_key)
    if not rows:
        raise RuntimeError("Character 데이터가 비어 있습니다.")

    mapped = [m for m in (map_row(r) for r in rows) if m]

    sb = create_client(supabase_url, service_key)
    # characterNum에 UNIQUE 인덱스가 있어야 on_conflict 동작
    sb.table("character").upsert(mapped, on_conflict="characterNum").execute()

    print(f"[done] synced characters: {len(mapped)}")


if __name__ == "__main__":
    main()
