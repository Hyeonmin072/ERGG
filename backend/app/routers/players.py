from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, HTTPException
from ..clients.er_api_client import get_er_client
from ..core.redis import cache_get, cache_set, cache_delete_pattern
from ..services.supabase_sync_service import (
    sync_user_games_to_supabase,
    sync_user_games_by_user_id_to_supabase,
)

router = APIRouter()


@router.get("/search")
async def search_player(nickname: str):
    """닉네임으로 플레이어 검색."""
    cache_key = f"player:search:{nickname}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    client = get_er_client()
    try:
        data = await client.search_by_nickname(nickname)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ER API 오류: {e}")

    if data.get("code") != 200:
        raise HTTPException(status_code=404, detail="플레이어를 찾을 수 없습니다.")

    result = data.get("user", {})
    await cache_set(cache_key, result, ttl=60)
    return result


@router.get("/{user_num}")
async def get_player(user_num: int, season_id: int = 33, mode: int = 3):
    """플레이어 프로필 조회 (랭크 스탯 포함)."""
    cache_key = f"player:profile:{user_num}:{season_id}:{mode}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    client = get_er_client()
    try:
        data = await client.get_user_stats(user_num, season_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ER API 오류: {e}")

    if data.get("code") != 200:
        raise HTTPException(status_code=404, detail="플레이어 정보를 찾을 수 없습니다.")

    result = data.get("userStats", [])
    # Filter by matchingTeamMode (mode corresponds to matchingTeamMode: 3=squad)
    stats = next((s for s in result if s.get("matchingTeamMode") == mode), None)
    if not stats:
        stats = result[0] if result else {}

    await cache_set(cache_key, stats, ttl=300)
    return stats


@router.get("/{user_num}/games")
async def get_player_games(user_num: int, page: int = 0, cursor: Optional[str] = None):
    """플레이어 최근 게임 목록."""
    cache_key = f"player:games:{user_num}:{page}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    client = get_er_client()
    try:
        data = await client.get_user_games(user_num, next_cursor=cursor)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ER API 오류: {e}")

    if data.get("code") != 200:
        raise HTTPException(status_code=404, detail="게임 목록을 찾을 수 없습니다.")

    result = {
        "games": data.get("userGames", []),
        "next": data.get("next"),
    }
    await cache_set(cache_key, result, ttl=120)
    return result


@router.post("/{user_num}/refresh")
async def refresh_player(user_num: int):
    """플레이어 캐시 무효화 및 재동기화 트리거."""
    await cache_delete_pattern(f"player:*:{user_num}*")
    await cache_delete_pattern(f"octagon:{user_num}*")
    return {"message": "캐시가 초기화되었습니다. 다음 조회 시 최신 데이터가 반영됩니다."}


@router.post("/{user_num}/sync-supabase")
async def sync_player_games_to_supabase(user_num: int, limit: int = 20):
    """userNum 기준 최근 게임을 Supabase에 업서트."""
    try:
        return await sync_user_games_to_supabase(user_num=user_num, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Supabase 동기화 실패: {e}")


@router.post("/sync-supabase/by-user-id")
async def sync_player_games_by_user_id(user_id: str, limit: int = 20):
    """
    userId 기준 동기화.
    내부적으로 userId -> userNum 변환 후 최근 게임을 Supabase에 업서트.
    """
    try:
        return await sync_user_games_by_user_id_to_supabase(user_id=user_id, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"userId 동기화 실패: {e}")
