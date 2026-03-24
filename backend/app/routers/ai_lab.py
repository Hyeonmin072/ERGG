from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..clients.gemini_client import generate, build_coach_prompt, build_meta_prompt, build_route_prompt
from ..clients.er_api_client import get_er_client
from ..core.redis import cache_get, cache_set
from datetime import date

router = APIRouter()


# ── 나쟈의 독설 ───────────────────────────────────────────────────────────────

class CoachRequest(BaseModel):
    user_num: int
    game_count: int = 20
    season_id: int = 33
    mode: int = 3


@router.post("/coach")
async def ai_coach(req: CoachRequest):
    """패배 로그 분석 → AI 코칭 피드백."""
    client = get_er_client()
    try:
        data = await client.get_user_games(req.user_num)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ER API 오류: {e}")

    if data.get("code") != 200:
        raise HTTPException(status_code=404, detail="게임 데이터를 찾을 수 없습니다.")

    games = [g for g in data.get("userGames", []) if g.get("matchingMode") == req.mode]
    recent = games[:req.game_count]

    if not recent:
        raise HTTPException(status_code=404, detail="분석할 게임이 없습니다.")

    # Aggregate stats
    n = len(recent)
    avg_rank = sum(g.get("gameRank", 12) for g in recent) / n
    avg_damage = sum(g.get("damageToPlayer", 0) for g in recent) / n
    avg_monster = sum(g.get("monsterKill", 0) for g in recent) / n
    avg_cameras = sum(g.get("addSurveillanceCamera", 0) + g.get("addTelephotoCamera", 0) for g in recent) / n
    avg_survivable = sum(g.get("survivableTime", 0) for g in recent) / n

    tk_total = max(sum(g.get("teamKill", 1) for g in recent), 1)
    ka_total = sum(g.get("playerKill", 0) + g.get("playerAssistant", 0) for g in recent)
    participation = (ka_total / tk_total) * 100

    scores = {
        "avg_rank": avg_rank, "avg_damage": avg_damage,
        "avg_monster_kill": avg_monster, "kill_participation": participation,
        "avg_cameras": avg_cameras, "avg_survivable_time": avg_survivable,
        "game_count": n,
    }
    # Weakest axis
    axes = {
        "생존": (1 - (avg_rank - 1) / 23) * 100,
        "시야": avg_cameras * 10,
        "사냥": avg_monster * 4,
        "결투": participation,
        "전투": avg_damage / 200,
    }
    scores["weakest_axis"] = min(axes, key=axes.get)

    # Death causes
    deaths = [g.get("causeOfDeath", "") for g in recent if g.get("causeOfDeath")]
    scores["top_cause_of_death"] = deaths[0] if deaths else "알 수 없음"

    nickname = recent[0].get("nickname", f"#{req.user_num}")
    prompt = build_coach_prompt(nickname, scores)

    try:
        feedback = await generate(prompt, temperature=0.8, max_tokens=600)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API 오류: {e}")

    return {"nickname": nickname, "gamesAnalyzed": n, "feedback": feedback}


# ── 메타 브리핑 ───────────────────────────────────────────────────────────────

@router.get("/meta")
async def meta_briefing(season_id: int = 33, team_mode: int = 3):
    """오늘의 메타 브리핑."""
    today = str(date.today())
    cache_key = f"meta:briefing:{today}:{season_id}:{team_mode}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    client = get_er_client()
    try:
        data = await client.get_top_rank(season_id, team_mode)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ER API 오류: {e}")

    if data.get("code") != 200:
        raise HTTPException(status_code=502, detail="랭킹 데이터를 가져올 수 없습니다.")

    top_users = data.get("topRanks", [])[:20]

    # Simple aggregation: character pick counts
    char_count: dict[str, int] = {}
    for u in top_users:
        char = str(u.get("characterNum", 0))
        char_count[char] = char_count.get(char, 0) + 1

    top_picks = sorted(
        [{"name": f"#{k}", "pick_rate": v / len(top_users) * 100} for k, v in char_count.items()],
        key=lambda x: x["pick_rate"], reverse=True,
    )[:5]
    top_win_rates = top_picks  # Simplified: same list for now

    prompt = build_meta_prompt(today, top_picks, top_win_rates)
    try:
        summary = await generate(prompt, temperature=0.6, max_tokens=400)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API 오류: {e}")

    result = {
        "date": today,
        "topPicks": top_picks,
        "topWinRate": top_win_rates,
        "summary": summary,
    }
    await cache_set(cache_key, result, ttl=3600)
    return result


# ── 루트 컨설턴트 ─────────────────────────────────────────────────────────────

class RouteRequest(BaseModel):
    character_num: int
    character_name: str
    style: str
    weapon: str = ""


@router.post("/route")
async def route_consultant(req: RouteRequest):
    """자연어 기반 루트 추천."""
    import hashlib
    h = hashlib.md5(f"{req.character_num}{req.style}{req.weapon}".encode()).hexdigest()[:8]
    cache_key = f"route:{req.character_num}:{h}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    prompt = build_route_prompt(req.character_name, req.character_num, req.style, req.weapon)
    try:
        recommendation = await generate(prompt, temperature=0.7, max_tokens=600)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API 오류: {e}")

    result = {
        "characterNum": req.character_num,
        "characterName": req.character_name,
        "style": req.style,
        "weapon": req.weapon,
        "recommendation": recommendation,
    }
    await cache_set(cache_key, result, ttl=1800)
    return result
