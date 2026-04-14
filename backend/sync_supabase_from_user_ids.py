"""
userId CSV를 읽어 유저당 최근 20게임을 Supabase에 저장한다.

입력:
  backend/dakgg_asia_season10_user_ids.csv
  (헤더: userId)

실행:
  python3 backend/sync_supabase_from_user_ids.py
"""

from __future__ import annotations

import asyncio
import csv
from pathlib import Path

from dotenv import load_dotenv

INPUT_CSV = Path(__file__).resolve().parent / "dakgg_asia_season10_user_ids.csv"
MAX_USERS = 1000
GAMES_PER_USER = 20


def load_user_ids(path: Path, limit: int) -> list[str]:
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    values = [r.get("userId", "").strip() for r in rows]
    return [v for v in values if v][:limit]


async def main() -> None:
    load_dotenv(Path(__file__).resolve().parent / ".env")
    # .env 로딩 이후 import 해야 settings가 올바른 값을 읽는다.
    from app.services.supabase_sync_service import sync_user_games_by_user_id_to_supabase
    from app.clients.supabase_client import get_supabase_client

    user_ids = load_user_ids(INPUT_CSV, MAX_USERS)
    if not user_ids:
        raise RuntimeError(f"userId가 없습니다: {INPUT_CSV}")

    # sync 시작 전: 기존 isIn1000 전체 초기화
    # → 오늘 sync된 유저만 isIn1000=true가 되도록 보장
    print("[init] isIn1000 전체 초기화 중...")
    sb = get_supabase_client()
    sb.table("players").update({"is_in1000": False}).neq("user_id", "").execute()
    print("[init] 초기화 완료")

    total_saved = 0
    total_users_ok = 0
    total_users_fail = 0

    for idx, user_id in enumerate(user_ids, start=1):
        try:
            res = await sync_user_games_by_user_id_to_supabase(
                user_id=user_id,
                limit=GAMES_PER_USER,
                is_in1000=True,
            )
            saved = int(res.get("saved", 0))
            total_saved += saved
            total_users_ok += 1
            print(
                f"[{idx}/{len(user_ids)}] OK userId={user_id} "
                f"saved={saved}"
            )
        except Exception as e:  # noqa: BLE001
            total_users_fail += 1
            print(f"[{idx}/{len(user_ids)}] FAIL userId={user_id} error={e}")

    print(
        f"[done] users_ok={total_users_ok} users_fail={total_users_fail} "
        f"saved_rows={total_saved} target_rows~={len(user_ids) * GAMES_PER_USER}"
    )


if __name__ == "__main__":
    asyncio.run(main())
