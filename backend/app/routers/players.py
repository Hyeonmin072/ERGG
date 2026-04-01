from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from ..clients.er_api_client import get_er_client
from ..core.config import settings
from ..core.redis import cache_get, cache_set, cache_delete_pattern
from ..services.supabase_sync_service import sync_user_games_by_user_id_to_supabase

router = APIRouter()


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
        await cache_set(cache_key, result, ttl=60)
    except Exception:
        pass
    return result


@router.get("/games/by-user-id")
async def get_player_games_by_user_id_route(
    userId: str,
    cursor: Optional[str] = None,
    maxPages: int = Query(
        2,
        ge=1,
        le=10,
        description="cursor 없을 때 ER에서 연속으로 가져올 페이지 수(1페이지≈10판). 기본 2→최대 ~20판.",
    ),
):
    """
    닉네임 검색 → user.userId 사용.

    - ER 1차: GET /v1/user/games/uid/{userId} (최대 ~10건)
    - 응답의 `next`가 있으면: GET /v1/user/games/uid/{userId}?next={next} 로 다음 ~10건
    - `cursor`가 있으면 해당 next부터 **한 페이지만** (더보기)
    - `cursor` 없고 `maxPages`>1 이면 서버에서 위를 연속 호출해 합침
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

    result = {
        "games": data.get("userGames", []),
        "next": data.get("next"),
    }
    try:
        await cache_set(cache_key, result, ttl=120)
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
    """userId 기준 최근 게임을 Supabase에 업서트."""
    try:
        return await sync_user_games_by_user_id_to_supabase(user_id=userId, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"userId 동기화 실패: {e}")
