"""
public.games, public.game_details, public.character 테이블에서
snake_case 컬럼이 있으면 schema.sql / ER API 와 동일한 camelCase(따옴표 식별자)로 RENAME.

실행 (backend 디렉터리, .env 의 DATABASE_URL 사용):
  cd backend && python3 migrate_db_camelcase.py

- Supabase: 보통 DATABASE_URL + ssl
- 로컬 Postgres: localhost 이면 ssl 끔

주의: 운영 DB 에서 실행 전 백업 권장. 멱등(이미 camelCase 면 스킵).
"""

from __future__ import annotations

import asyncio
import os
import re
from pathlib import Path

from dotenv import load_dotenv


def _sqlalchemy_to_asyncpg_dsn(url: str) -> str:
    if url.startswith("postgresql+asyncpg://"):
        return "postgresql://" + url[len("postgresql+asyncpg://") :]
    return url


def _camel_to_snake(name: str) -> str:
    s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
    return re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1).lower()


# supabase_sync_service._build_game_detail_row 키 기준 → (snake, camel) 후보
_GD_CAMEL_KEYS = [
    "gameId",
    "userId",
    "userNum",
    "characterNum",
    "characterLevel",
    "skinCode",
    "gameRank",
    "victory",
    "giveUp",
    "teamSpectator",
    "teamNumber",
    "preMade",
    "escapeState",
    "playerKill",
    "playerAssistant",
    "monsterKill",
    "playerDeaths",
    "teamKill",
    "totalFieldKill",
    "bestWeapon",
    "bestWeaponLevel",
    "playTime",
    "watchTime",
    "totalTime",
    "survivableTime",
    "mmrBefore",
    "mmrGain",
    "mmrAfter",
    "rankPoint",
    "maxHp",
    "maxSp",
    "attackPower",
    "defense",
    "attackSpeed",
    "moveSpeed",
    "sightRange",
    "attackRange",
    "damageToPlayer",
    "damageFromPlayer",
    "damageToMonster",
    "damageFromMonster",
    "healAmount",
    "protectAbsorb",
    "ccTimeToPlayer",
    "craftUncommon",
    "craftRare",
    "craftEpic",
    "craftLegend",
    "craftMythic",
    "gainExp",
    "baseExp",
    "bonusExp",
    "bonusCoin",
    "routeIdOfStart",
    "routeSlotId",
    "placeOfStart",
    "battleZonePlayerKill",
    "battleZoneDeaths",
    "serverName",
    "language",
    "expireDtm",
    "equipment",
    "equipmentGrade",
    "masteryLevel",
    "skillLevelInfo",
    "skillOrderInfo",
    "killMonsters",
    "traitFirstCore",
    "traitFirstSub",
    "traitSecondSub",
    "foodCraftCount",
    "totalVFCredits",
    "usedVFCredits",
    "scoredPoint",
    "creditSource",
    "eventMissionResult",
    "itemTransferredConsole",
    "itemTransferredDrone",
    "collectItemForLog",
    "equipFirstItemForLog",
    "boughtInfusion",
    "killDetails",
    "deathDetails",
]

_GAMES_CAMEL_KEYS = [
    "gameId",
    "seasonId",
    "matchingMode",
    "matchingTeamMode",
    "serverName",
    "versionMajor",
    "versionMinor",
    "startDtm",
    "duration",
    "matchSize",
    "botAdded",
    "botRemain",
    "restrictedAreaAccelerated",
    "safeAreas",
    "mmrAvg",
    "createdAt",
]

_CHARACTER_CAMEL_KEYS = [
    "characterNum",
    "name",
    "nameKo",
    "nameEn",
    "weaponType",
    "weaponCode",
    "battleType",
    "masteryWeaponCodes",
    "sourcePayload",
]


def _rename_pairs(camel_keys: list[str]) -> list[tuple[str, str]]:
    return [(_camel_to_snake(k), k) for k in camel_keys]


async def _column_exists(conn, table: str, col: str) -> bool:
    row = await conn.fetchrow(
        """
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
        """,
        table,
        col,
    )
    return row is not None


def _table_sql(table: str) -> str:
    if table == "character":
        return 'public."character"'
    return f"public.{table}"


async def _rename_if_needed(conn, table: str, snake: str, camel: str) -> bool:
    if snake == camel:
        return False
    if not await _column_exists(conn, table, snake):
        return False
    if await _column_exists(conn, table, camel):
        print(f"[skip] {table}.\"{camel}\" 이미 있음 — {snake} 수동 확인")
        return False
    tbl = _table_sql(table)
    # snake 컬럼은 일반적으로 소문자 game_id 형태
    sql = f'ALTER TABLE {tbl} RENAME COLUMN {snake} TO "{camel}"'
    await conn.execute(sql)
    print(f"[ok] {table}.{snake} → \"{camel}\"")
    return True


async def main_async() -> None:
    load_dotenv(Path(__file__).resolve().parent / ".env")
    raw = (os.getenv("DATABASE_URL") or "").strip()
    if not raw:
        raise SystemExit("DATABASE_URL 이 없습니다. backend/.env 를 확인하세요.")

    dsn = _sqlalchemy_to_asyncpg_dsn(raw)
    use_ssl = not ("localhost" in dsn or "127.0.0.1" in dsn)

    import asyncpg

    conn = await asyncpg.connect(dsn, ssl=use_ssl if use_ssl else False)
    try:
        for snake, camel in _rename_pairs(_GAMES_CAMEL_KEYS):
            await _rename_if_needed(conn, "games", snake, camel)

        for snake, camel in _rename_pairs(_GD_CAMEL_KEYS):
            await _rename_if_needed(conn, "game_details", snake, camel)

        for snake, camel in _rename_pairs(_CHARACTER_CAMEL_KEYS):
            if snake == "name":
                continue
            await _rename_if_needed(conn, "character", snake, camel)

        print("[done] camelCase 마이그레이션 시도 완료")
    finally:
        await conn.close()


def main() -> None:
    asyncio.run(main_async())


if __name__ == "__main__":
    main()
