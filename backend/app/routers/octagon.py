from fastapi import APIRouter, HTTPException
from ..clients.er_api_client import get_er_client
from ..services.octagon_service import calculate, normalize_er_user_game_for_octagon
from ..core.redis import cache_get, cache_set

router = APIRouter()


@router.get("/by-user-id")
async def get_octagon_by_user_id(userId: str, seasonId: int = 33, mode: int = 3):
    """유저의 옥타곤 점수 반환 (userId 기준)."""
    uid = userId.strip()
    if not uid:
        raise HTTPException(status_code=400, detail="userId가 필요합니다.")

    cache_key = f"octagon:uid:{uid}:{seasonId}:{mode}"
    try:
        cached = await cache_get(cache_key)
        if cached:
            return cached
    except Exception:
        pass

    client = get_er_client()
    try:
        # 전적과 동일하게 1·2페이지(~20건)까지 합쳐 랭크 모드 필터에 사용
        data = await client.get_user_games_by_user_id_merged(uid, max_pages=2)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ER API 오류: {e}")

    if data.get("code") != 200:
        raise HTTPException(status_code=404, detail="게임 데이터를 찾을 수 없습니다.")

    games = data.get("userGames", [])
    ranked = [g for g in games if g.get("matchingMode") == mode][:20]

    if not ranked:
        raise HTTPException(status_code=404, detail="분석할 게임 데이터가 없습니다.")

    rows = [normalize_er_user_game_for_octagon(g) for g in ranked]
    result = calculate(rows)
    response = {
        "userId": uid,
        "seasonId": seasonId,
        "matchingMode": mode,
        "engagement": result.engagement,
        "hunting": result.hunting,
        "vision": result.vision,
        "survival": result.survival,
        "sustain": result.sustain,
        "centerGrade": result.center_grade,
        "gamesAnalyzed": result.games_analyzed,
    }

    try:
        await cache_set(cache_key, response, ttl=600)
    except Exception:
        pass
    return response
