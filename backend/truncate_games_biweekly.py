from __future__ import annotations

import asyncio
import os
from datetime import datetime, timedelta, timezone

import asyncpg

# 기준일: 2026-04-30 (목)
ANCHOR_DATE = datetime(2026, 4, 30).date()
KST = timezone(timedelta(hours=9))


def _is_biweekly_target_day(now_kst: datetime) -> tuple[bool, int]:
    """Return (is_target_day, delta_days_from_anchor)."""
    today = now_kst.date()
    delta_days = (today - ANCHOR_DATE).days
    if delta_days < 0:
        return (False, delta_days)
    # 목요일(3) + 14일 간격
    return (now_kst.weekday() == 3 and delta_days % 14 == 0, delta_days)


async def _count_rows(conn: asyncpg.Connection, table_name: str) -> int:
    q = f"select count(*)::bigint as c from public.{table_name}"
    row = await conn.fetchrow(q)
    return int(row["c"]) if row else 0


async def main() -> None:
    database_url = (os.getenv("DATABASE_URL") or "").strip()
    if not database_url:
        raise RuntimeError("Missing DATABASE_URL")

    now_kst = datetime.now(KST)
    should_run, delta_days = _is_biweekly_target_day(now_kst)
    print(
        f"[check] now_kst={now_kst.isoformat()} "
        f"anchor={ANCHOR_DATE.isoformat()} delta_days={delta_days} should_run={should_run}"
    )
    if not should_run:
        print("[skip] Not a biweekly Thursday target day.")
        return

    conn = await asyncpg.connect(database_url, statement_cache_size=0)
    try:
        before_games = await _count_rows(conn, "games")
        before_details = await _count_rows(conn, "game_details")
        print(f"[before] games={before_games} game_details={before_details}")

        await conn.execute("TRUNCATE TABLE public.games CASCADE")

        after_games = await _count_rows(conn, "games")
        after_details = await _count_rows(conn, "game_details")
        print(f"[after] games={after_games} game_details={after_details}")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
