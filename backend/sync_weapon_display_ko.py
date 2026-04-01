"""
통계/UI용 무기 코드(1..23 + 24) 한글 표시명을 Supabase `weapon` 테이블에 반영한다.
내용은 app.data.weapon_type_ko.WEAPON_TYPE_EN_TO_KO / EXTRA_BEST_WEAPON_CODE_TO_KO 와 동일.

실행:
  cd backend && python3 sync_weapon_display_ko.py
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

from app.data.weapon_type_ko import WEAPON_TYPE_INFO_ORDER_EN, build_code_to_ko_map


def main() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(env_path)

    supabase_url = os.getenv("SUPABASE_URL", "").strip() or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not supabase_url or not service_key:
        raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 설정이 필요합니다.")

    m = build_code_to_ko_map(WEAPON_TYPE_INFO_ORDER_EN)
    rows = [{"id": k, "name": v} for k, v in sorted(m.items())]

    sb = create_client(supabase_url, service_key)
    sb.table("weapon").upsert(rows, on_conflict="id").execute()
    print(f"[done] weapon 표시명 upsert: {len(rows)} rows (ids {min(m)}..{max(m)})")


if __name__ == "__main__":
    main()
