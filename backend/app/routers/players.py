from __future__ import annotations

import logging
from typing import Any, Optional

import httpx
from fastapi import APIRouter, BackgroundTasks, HTTPException, Query
from ..clients.er_api_client import get_er_client
from ..clients.supabase_client import get_supabase_client
from ..core.config import settings
from ..core.redis import cache_get, cache_set, cache_delete_pattern
from ..services.supabase_sync_service import sync_user_games_by_user_id_to_supabase

router = APIRouter()
_log = logging.getLogger(__name__)


async def _persist_search_rank_games(user_id: str, limit: int) -> None:
    """검색 유입 시 랭크 전적만 Supabase에 저장 (is_in1000 등 플래그는 변경하지 않음)."""
    try:
        await sync_user_games_by_user_id_to_supabase(
            user_id=user_id,
            limit=limit,
            touch_in1000_fields=False,
        )
    except httpx.HTTPStatusError as e:
        if e.response is not None and e.response.status_code == 429:
            _log.warning("Background persist skipped by ER rate limit userId=%s", user_id)
            return
        _log.exception("Background persist rank games failed userId=%s", user_id)
    except Exception:
        _log.exception("Background persist rank games failed userId=%s", user_id)


def _to_int(v: object) -> int | None:
    try:
        n = int(v)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None
    return n if n > 0 else None


def _build_equipment_images_for_games(games: list[dict]) -> None:
    """
    game dict에 equipmentImages 필드 주입:
    - slots["0".."4"]: equipment 슬롯 코드 기반 매핑
      - slot 0: type=weapon
      - slot 1..4: type=armor
    """
    if not games:
        return
    try:
        sb = get_supabase_client()
    except Exception:
        return

    weapon_codes: set[int] = set()
    armor_codes: set[int] = set()

    for g in games:
        eq = g.get("equipment")
        if isinstance(eq, dict):
            w = _to_int(eq.get("0"))
            if w:
                weapon_codes.add(w)
            for slot in ("1", "2", "3", "4"):
                c = _to_int(eq.get(slot))
                if c:
                    armor_codes.add(c)

    weapon_map: dict[int, dict] = {}
    armor_map: dict[int, dict] = {}
    try:
        if weapon_codes:
            resp = (
                sb.table("item")
                .select("type,code,kind,name_kr,name_en,image_path")
                .eq("type", "weapon")
                .in_("code", sorted(weapon_codes))
                .execute()
            )
            for row in resp.data or []:
                c = _to_int((row or {}).get("code"))
                if c:
                    weapon_map[c] = row
        if armor_codes:
            resp = (
                sb.table("item")
                .select("type,code,kind,name_kr,name_en,image_path")
                .eq("type", "armor")
                .in_("code", sorted(armor_codes))
                .execute()
            )
            for row in resp.data or []:
                c = _to_int((row or {}).get("code"))
                if c:
                    armor_map[c] = row
    except Exception:
        return

    for g in games:
        out: dict[str, dict] = {"slots": {}}
        eq = g.get("equipment")
        if isinstance(eq, dict):
            for slot in ("0", "1", "2", "3", "4"):
                c = _to_int(eq.get(slot))
                if not c:
                    continue
                if slot == "0":
                    r = weapon_map.get(c)
                else:
                    r = armor_map.get(c)
                if not r:
                    continue
                out["slots"][slot] = {
                    "code": c,
                    "kind": r.get("kind"),
                    "nameKr": r.get("name_kr"),
                    "nameEn": r.get("name_en"),
                    "imagePath": r.get("image_path"),
                }
        g["equipmentImages"] = out


def _extract_ladder_rank(payload: object) -> int | None:
    """
    stats 응답에서 rank/userRank/ranking/ladderRank를 재귀 탐색해 첫 양수 등수를 반환.
    """
    stack: list[object] = [payload]
    while stack:
        cur = stack.pop()
        if isinstance(cur, dict):
            for k in ("rank", "userRank", "ranking", "ladderRank"):
                n = _to_int(cur.get(k))
                if n is not None:
                    return n
            for v in cur.values():
                if isinstance(v, (dict, list)):
                    stack.append(v)
        elif isinstance(cur, list):
            for v in cur:
                if isinstance(v, (dict, list)):
                    stack.append(v)
    return None


@router.get("/search")
async def search_player(nickname: str):
    """ER GET /v1/user/nickname?query=닉네임 → 응답 user.userId 로 이후 전적 조회에 사용."""
    nickname = (nickname or "").strip()
    if not nickname:
        raise HTTPException(status_code=400, detail="nickname이 필요합니다.")
    cache_key = f"player:search:{nickname}"
    try:
        cached = await cache_get(cache_key)
        if cached:
            games_cached = cached.get("games") if isinstance(cached, dict) else None
            if isinstance(games_cached, list):
                _build_equipment_images_for_games(games_cached)
            return cached
    except Exception:
        pass

    if not (settings.er_api_key or "").strip():
        raise HTTPException(
            status_code=503,
            detail="ER_API_KEY가 설정되지 않았습니다. backend/.env를 확인하세요.",
        )

    client = get_er_client()
    try:
        data = await client.search_by_nickname(nickname)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ER API 오류: {e}")

    if data.get("code") != 200:
        raise HTTPException(status_code=404, detail="플레이어를 찾을 수 없습니다.")

    raw = data.get("user") or {}
    result = {
        "nickname": raw.get("nickname") or "",
        "userId": raw.get("userId")
        or raw.get("user_id")
        or raw.get("userID"),
    }
    try:
        await cache_set(cache_key, result)
    except Exception:
        pass
    return result


@router.get("/games/by-user-id")
async def get_player_games_by_user_id_route(
    userId: str,
    background_tasks: BackgroundTasks,
    cursor: Optional[str] = None,
    maxPages: int = Query(
        2,
        ge=1,
        le=10,
        description="cursor 없을 때 ER에서 연속으로 가져올 페이지 수(1페이지≈10판). 기본 2→최대 ~20판.",
    ),
    persist: bool = Query(
        False,
        description=(
            "If true, after this request (no cursor) persist up to persistLimit rank "
            "(matchingMode=3) games to Supabase in the background; does not change is_in1000."
        ),
    ),
    persistLimit: int = Query(
        20,
        ge=1,
        le=100,
        description="Max rank (matchingMode=3) games to store when persist is true.",
    ),
):
    """
    닉네임 검색 → user.userId 사용.

    - ER 1차: GET /v1/user/games/uid/{userId} (최대 ~10건)
    - 응답의 `next`가 있으면: GET /v1/user/games/uid/{userId}?next={next} 로 다음 ~10건
    - `cursor`가 있으면 해당 next부터 **한 페이지만** (더보기)
    - `cursor` 없고 `maxPages`>1 이면 서버에서 위를 연속 호출해 합침
    - `persist=true` and no cursor: background persist of rank games (any user, including self-search).
    """
    uid = userId.strip()
    if not uid:
        raise HTTPException(status_code=400, detail="userId가 필요합니다.")

    cursor = (cursor or "").strip() or None

    if cursor is not None:
        cache_key = f"player:games:uid:{uid}:c:{cursor}"
    else:
        cache_key = f"player:games:uid:{uid}:p{maxPages}:first"

    try:
        cached = await cache_get(cache_key)
        if cached:
            return cached
    except Exception:
        pass

    client = get_er_client()
    try:
        if cursor is not None:
            data = await client.get_user_games_by_user_id(uid, next_cursor=cursor)
        else:
            data = await client.get_user_games_by_user_id_merged(
                uid, start_cursor=None, max_pages=maxPages
            )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ER API 오류: {e}")

    if data.get("code") != 200:
        raise HTTPException(status_code=404, detail="게임 목록을 찾을 수 없습니다.")

    games = data.get("userGames", []) or []
    if isinstance(games, list):
        _build_equipment_images_for_games(games)
    ladder_rank: int | None = None
    if cursor is None and isinstance(games, list) and len(games) > 0:
        ranked_game = next((g for g in games if int((g or {}).get("matchingMode") or 0) == 3), None)
        base_game = ranked_game or games[0]
        try:
            season_id = int((base_game or {}).get("seasonId") or 0)
        except Exception:
            season_id = 0
        matching_mode = 3  # 래더 등수는 랭크(3) 기준
        if season_id > 0 and matching_mode > 0:
            try:
                stats_data = await client.get_user_stats_by_user_id(uid, season_id, matching_mode)
                ladder_rank = _extract_ladder_rank(stats_data)
            except Exception:
                ladder_rank = None
    result: dict[str, Any] = {
        "games": games,
        "next": data.get("next"),
        "ladderRank": ladder_rank,
    }
    if persist and cursor is None:
        background_tasks.add_task(_persist_search_rank_games, uid, persistLimit)
        result["persistScheduled"] = True
    try:
        await cache_set(cache_key, {k: v for k, v in result.items() if k != "persistScheduled"})
    except Exception:
        pass
    return result


@router.post("/refresh/by-user-id")
async def refresh_player_by_user_id(userId: str):
    """플레이어·옥타곤 캐시 무효화 (userId 기준)."""
    uid = userId.strip()
    if not uid:
        raise HTTPException(status_code=400, detail="userId가 필요합니다.")
    await cache_delete_pattern(f"player:games:uid:{uid}*")
    await cache_delete_pattern(f"octagon:uid:{uid}*")
    return {"message": "캐시가 초기화되었습니다. 다음 조회 시 최신 데이터가 반영됩니다."}


@router.post("/sync-supabase/by-user-id")
async def sync_player_games_by_user_id(userId: str, limit: int = 20):
    """Upsert rank games (limit) for userId. Does not modify is_in1000 / in1000_sync_at."""
    try:
        return await sync_user_games_by_user_id_to_supabase(
            user_id=userId,
            limit=limit,
            touch_in1000_fields=False,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"userId 동기화 실패: {e}")
