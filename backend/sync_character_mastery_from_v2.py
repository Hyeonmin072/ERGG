"""
/v2/data/CharacterAttributes + WeaponTypeInfo 를 기준으로
character.masteryWeaponCodes 를 채운다 (best_weapon / WeaponTypeInfo 1-based 코드 배열).

실행 전: Supabase에 migrations/20260402_add_character_mastery_weapon_codes.sql 적용.

  python3 backend/sync_character_mastery_from_v2.py
"""

from __future__ import annotations

import os
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any

_BACKEND = Path(__file__).resolve().parent
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

import httpx
from dotenv import load_dotenv
from postgrest.exceptions import APIError
from supabase import create_client

from app.data.weapon_type_ko import WEAPON_TYPE_INFO_ORDER_EN

BASE_URL = "https://open-api.bser.io"


def _fetch_weapon_type_order(api_key: str) -> list[str]:
    headers = {"accept": "application/json"}
    if api_key:
        headers["x-api-key"] = api_key
    with httpx.Client(timeout=30) as client:
        resp = client.get(
            f"{BASE_URL}/v2/data/WeaponTypeInfo",
            headers=headers,
            params={"locale": "ko"},
        )
        resp.raise_for_status()
        payload = resp.json()
        data = payload.get("data")
        if isinstance(data, list) and data:
            order = [str(row.get("type") or "") for row in data if isinstance(row, dict)]
            order = [x for x in order if x]
            if len(order) >= 10:
                return order
    return WEAPON_TYPE_INFO_ORDER_EN


def _type_en_to_code(order: list[str]) -> dict[str, int]:
    return {en: i + 1 for i, en in enumerate(order)}


def _extract_attribute_rows(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [x for x in payload if isinstance(x, dict)]
    if not isinstance(payload, dict):
        return []
    for key in ("data", "result", "CharacterAttributes"):
        v = payload.get(key)
        if isinstance(v, list):
            return [x for x in v if isinstance(x, dict)]
    return []


def fetch_character_attributes(api_key: str) -> list[dict[str, Any]]:
    headers = {"accept": "application/json"}
    if api_key:
        headers["x-api-key"] = api_key
    with httpx.Client(timeout=30) as client:
        resp = client.get(
            f"{BASE_URL}/v2/data/CharacterAttributes",
            headers=headers,
            params={"locale": "ko"},
        )
        resp.raise_for_status()
        return _extract_attribute_rows(resp.json())


def group_masteries_by_character(rows: list[dict[str, Any]]) -> dict[int, list[str]]:
    by_char: dict[int, list[str]] = defaultdict(list)
    for r in rows:
        cc = r.get("characterCode")
        m = r.get("mastery")
        if cc is None or not m:
            continue
        try:
            cn = int(cc)
        except (TypeError, ValueError):
            continue
        by_char[cn].append(str(m))
    return by_char


def main() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(env_path)

    api_key = os.getenv("ER_API_KEY", "").strip()
    supabase_url = os.getenv("SUPABASE_URL", "").strip() or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not supabase_url or not service_key:
        raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 설정이 필요합니다.")

    type_order = _fetch_weapon_type_order(api_key)
    en_to_code = _type_en_to_code(type_order)

    rows = fetch_character_attributes(api_key)
    if not rows:
        raise RuntimeError("CharacterAttributes 데이터가 비어 있습니다.")

    by_char = group_masteries_by_character(rows)
    sb = create_client(supabase_url, service_key)

    unknown: set[str] = set()
    updated = 0
    for cn, masteries in sorted(by_char.items()):
        codes: list[int] = []
        seen: set[int] = set()
        for m in masteries:
            code = en_to_code.get(m)
            if code is None:
                unknown.add(m)
                continue
            if code not in seen:
                seen.add(code)
                codes.append(code)
        codes.sort()
        try:
            sb.table("character").update({"masteryWeaponCodes": codes}).eq("characterNum", cn).execute()
        except APIError as e:
            err = getattr(e, "message", None) or str(e)
            if "masteryWeaponCodes" in err or "PGRST204" in str(e):
                raise RuntimeError(
                    "character.masteryWeaponCodes 컬럼이 없습니다. "
                    "Supabase SQL에 backend/sql/migrations/20260402_add_character_mastery_weapon_codes.sql 을 실행하세요."
                ) from e
            raise
        updated += 1

    if unknown:
        print("[warn] 알 수 없는 mastery 문자열 (WeaponTypeInfo 순서에 없음):", sorted(unknown))

    print(f"[done] masteryWeaponCodes 갱신: {updated}명 (CharacterAttributes 캐릭터 수)")


if __name__ == "__main__":
    main()
