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
    """Preserve CSV order; each userId only once (dedupe input rows)."""
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    seen: set[str] = set()
    out: list[str] = []
    for r in rows:
        v = (r.get("userId", "") or "").strip()
        if not v or v in seen:
            continue
        seen.add(v)
        out.append(v)
        if len(out) >= limit:
            break
    return out


async def main() -> None:
    load_dotenv(Path(__file__).resolve().parent / ".env")
    # .env 로딩 이후 import 해야 settings가 올바른 값을 읽는다.
    from app.services.supabase_sync_service import sync_user_games_by_user_id_to_supabase
    from app.clients.supabase_client import get_supabase_client

    user_ids = load_user_ids(INPUT_CSV, MAX_USERS)
    if not user_ids:
        raise RuntimeError(f"userId가 없습니다: {INPUT_CSV}")

    sb = get_supabase_client()
    in1000_columns_available = True
    # sync 시작 전: 오늘 배치에 안 들어간 유저는 is_in1000=false (컬럼 있을 때만)
    print("[init] is_in1000 전체 초기화 시도...")
    try:
        sb.table("players").update({"is_in1000": False}).neq("user_id", "").execute()
        print("[init] 초기화 완료")
    except Exception as e:  # noqa: BLE001
        err = str(e).lower()
        if "is_in1000" in err or "pgrst204" in err or "schema cache" in err:
            in1000_columns_available = False
            print(
                "[warn] players.is_in1000 컬럼 없음 — 마이그레이션을 실행하세요:\n"
                "       backend/sql/migrations/20260414_add_in1000_flag_to_players.sql\n"
                "       (Supabase SQL Editor). in1000 플래그 없이 게임 동기화만 진행합니다."
            )
        else:
            raise

    total_saved = 0
    total_users_ok = 0
    total_users_fail = 0

    for idx, user_id in enumerate(user_ids, start=1):
        try:
            res = await sync_user_games_by_user_id_to_supabase(
                user_id=user_id,
                limit=GAMES_PER_USER,
                is_in1000=True,
                in1000_columns_available=in1000_columns_available,
                touch_in1000_fields=True,
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
