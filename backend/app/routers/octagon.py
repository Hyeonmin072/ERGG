from fastapi import APIRouter, HTTPException
from ..clients.er_api_client import get_er_client
from ..services.octagon_service import calculate
from ..core.redis import cache_get, cache_set

router = APIRouter()


@router.get("/{user_num}")
async def get_octagon(user_num: int, season_id: int = 33, mode: int = 3):
    """유저의 옥타곤 6축 점수 반환."""
    cache_key = f"octagon:{user_num}:{season_id}:{mode}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    client = get_er_client()
    try:
        data = await client.get_user_games(user_num)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ER API 오류: {e}")

    if data.get("code") != 200:
        raise HTTPException(status_code=404, detail="게임 데이터를 찾을 수 없습니다.")

    games = data.get("userGames", [])
    # Filter by matching mode and take last 20
    ranked = [g for g in games if g.get("matchingMode") == mode][:20]

    if not ranked:
        raise HTTPException(status_code=404, detail="분석할 게임 데이터가 없습니다.")

    result = calculate(ranked)
    response = {
        "userNum": user_num,
        "seasonId": season_id,
        "matchingMode": mode,
        "combat": result.combat,
        "takedown": result.takedown,
        "hunting": result.hunting,
        "vision": result.vision,
        "mastery": result.mastery,
        "survival": result.survival,
        "centerGrade": result.center_grade,
        "gamesAnalyzed": result.games_analyzed,
    }

    await cache_set(cache_key, response, ttl=600)
    return response
