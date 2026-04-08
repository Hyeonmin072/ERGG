"""
Supabase `weapon` 테이블을 채운다. 컬럼 의미는 schema.sql 과 동일:
  id   — best_weapon 코드
  name — 한글 표시 (통계/UI 기준)
  nameEn — /v2/data/WeaponTypeInfo 의 type (실패 시 WEAPON_TYPE_INFO_ORDER_EN)

실행:
  cd backend && PYTHONPATH=. python3 sync_weapon_display_ko.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

_BACKEND = Path(__file__).resolve().parent
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

import httpx
from dotenv import load_dotenv
from postgrest.exceptions import APIError
from supabase import create_client

from app.data.weapon_type_ko import (
    EXTRA_BEST_WEAPON_CODE_TO_KO,
    WEAPON_TYPE_INFO_ORDER_EN,
    weapon_type_en_to_ko_label,
)


def _fetch_weapon_type_order_en(api_key: str, base_url: str) -> list[str]:
    if not api_key:
        return list(WEAPON_TYPE_INFO_ORDER_EN)
    try:
        url = f"{base_url.rstrip('/')}/v2/data/WeaponTypeInfo"
        resp = httpx.get(
            url,
            params={"locale": "ko"},
            headers={"x-api-key": api_key, "accept": "application/json"},
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json().get("data")
        if not isinstance(data, list) or not data:
            return list(WEAPON_TYPE_INFO_ORDER_EN)
        order = [str(row.get("type") or "") for row in data if isinstance(row, dict)]
        order = [x for x in order if x]
        if len(order) >= 10:
            return order
    except Exception:
        pass
    return list(WEAPON_TYPE_INFO_ORDER_EN)


def build_weapon_rows(api_key: str, base_url: str) -> list[dict]:
    order_en = _fetch_weapon_type_order_en(api_key, base_url)
    rows: list[dict] = []
    for i, en in enumerate(order_en):
        code = i + 1
        ko = weapon_type_en_to_ko_label(en)
        rows.append({"id": code, "name": ko, "nameEn": en})
    extra_en: dict[int, str] = {24: "Arcana", 25: "VFArm"}
    for code, ko in sorted(EXTRA_BEST_WEAPON_CODE_TO_KO.items()):
        rows.append({"id": code, "name": ko, "nameEn": extra_en.get(code, "")})
    return rows


def main() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(env_path)

    supabase_url = os.getenv("SUPABASE_URL", "").strip() or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    api_key = os.getenv("ER_API_KEY", "").strip()
    base_url = os.getenv("ER_API_BASE_URL", "https://open-api.bser.io").strip()
    if not supabase_url or not service_key:
        raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 설정이 필요합니다.")

    rows = build_weapon_rows(api_key, base_url)
    sb = create_client(supabase_url, service_key)
    try:
        sb.table("weapon").upsert(rows, on_conflict="id").execute()
    except APIError as e:
        err = str(e)
        if "nameEn" in err or "PGRST204" in err:
            raise RuntimeError(
                "weapon.nameEn 컬럼이 없습니다. "
                "Supabase SQL에 backend/sql/migrations/20260402_add_weapon_name_en.sql 을 실행한 뒤 잠시 후 다시 시도하세요."
            ) from e
        raise
    print(f"[done] weapon name + nameEn upsert: {len(rows)} rows (ids {rows[0]['id']}..{rows[-1]['id']})")


if __name__ == "__main__":
    main()
