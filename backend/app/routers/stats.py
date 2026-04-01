from __future__ import annotations

from collections import defaultdict
from fastapi import APIRouter, HTTPException, Query

from ..clients.supabase_client import get_supabase_client

router = APIRouter()


def _to_num(v: object, default: float = 0.0) -> float:
    if v is None:
        return default
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def _to_int(v: object, default: int = 0) -> int:
    if v is None:
        return default
    try:
        return int(v)
    except (TypeError, ValueError):
        return default


def _fetch_all_rows(table: str, columns: str, batch_size: int = 1000) -> list[dict]:
    sb = get_supabase_client()
    rows: list[dict] = []
    start = 0
    while True:
        end = start + batch_size - 1
        resp = sb.table(table).select(columns).range(start, end).execute()
        data = resp.data or []
        rows.extend(data)
        if len(data) < batch_size:
            break
        start += batch_size
    return rows


def _percentile_scores(values: list[float]) -> list[float]:
    """
    PERCENT_RANK 유사 계산.
    값 오름차순 기준으로 0~100 점수.
    동일 값은 동일 점수.
    """
    n = len(values)
    if n <= 1:
        return [100.0] * n
    sorted_unique = sorted(set(values))
    idx_map = {v: i for i, v in enumerate(sorted_unique)}
    denom = max(len(sorted_unique) - 1, 1)
    return [(idx_map[v] / denom) * 100.0 for v in values]


def _tier_grade(score: float) -> str:
    if score >= 90:
        return "S+"
    if score >= 80:
        return "S"
    if score >= 68:
        return "A"
    if score >= 55:
        return "B"
    if score >= 42:
        return "C"
    return "D"


@router.get("/characters")
async def get_character_stats(min_games: int = Query(10, ge=1, le=10000), limit: int = Query(100, ge=1, le=300)):
    """
    캐릭터 통계:
    - 평균 데미지(=damage_to_player)
    - 평균 동물 딜량(damage_to_monster)
    - 픽률/승률/top3/평균순위
    - 평균 RP 획득량(mmr_gain), 평균 TK(team_kill), 평균 킬(player_kill)
    """
    try:
        games_rows = _fetch_all_rows("games", "game_id,matching_mode,matching_team_mode")
        ranked_squad_game_ids = {
            _to_int(g.get("game_id"))
            for g in games_rows
            if _to_int(g.get("matching_mode")) == 3 and _to_int(g.get("matching_team_mode")) == 3
        }
        rows = _fetch_all_rows(
            "game_details",
            "game_id,character_num,game_rank,victory,damage_to_player,damage_to_monster,mmr_gain,team_kill,player_kill",
        )
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"games/game_details 조회 실패: {e}")

    rows = [r for r in rows if _to_int(r.get("game_id")) in ranked_squad_game_ids]

    if not rows:
        return {"total_games": 0, "count": 0, "items": []}

    totals = len(rows)
    agg: dict[int, dict[str, float]] = defaultdict(
        lambda: {
            "games": 0,
            "wins": 0,
            "top3": 0,
            "sum_rank": 0.0,
            "sum_damage_to_player": 0.0,
            "sum_damage_to_monster": 0.0,
            "sum_mmr_gain": 0.0,
            "sum_team_kill": 0.0,
            "sum_player_kill": 0.0,
        }
    )

    for r in rows:
        c = _to_int(r.get("character_num"), -1)
        if c < 0:
            continue
        a = agg[c]
        a["games"] += 1
        a["wins"] += 1 if _to_int(r.get("victory")) == 1 else 0
        a["top3"] += 1 if _to_int(r.get("game_rank"), 999) <= 3 else 0
        a["sum_rank"] += _to_num(r.get("game_rank"))
        a["sum_damage_to_player"] += _to_num(r.get("damage_to_player"))
        a["sum_damage_to_monster"] += _to_num(r.get("damage_to_monster"))
        a["sum_mmr_gain"] += _to_num(r.get("mmr_gain"))
        a["sum_team_kill"] += _to_num(r.get("team_kill"))
        a["sum_player_kill"] += _to_num(r.get("player_kill"))

    # character 테이블 데이터(있는 것만) 이름 매핑
    char_name_map: dict[int, str] = {}
    try:
        chars = _fetch_all_rows('character', 'name,"characterNum"')
        for c in chars:
            num = _to_int(c.get("characterNum"), -1)
            if num >= 0:
                char_name_map[num] = str(c.get("name") or "")
    except Exception:
        # character 테이블 없거나 컬럼명이 다르면 이름 없이 반환
        pass

    raw_items: list[dict] = []
    for character_num, a in agg.items():
        games = int(a["games"])
        if games < min_games:
            continue
        avg_rank = a["sum_rank"] / games
        raw_items.append(
            {
                "character_num": character_num,
                "character_name": char_name_map.get(character_num),
                "games": games,
                "pick_rate_pct": (games / totals) * 100,
                "win_rate_pct": (a["wins"] / games) * 100,
                "top3_rate_pct": (a["top3"] / games) * 100,
                "avg_rank": avg_rank,
                "avg_damage": a["sum_damage_to_player"] / games,
                "avg_damage_to_monster": a["sum_damage_to_monster"] / games,
                "avg_rp_gain": a["sum_mmr_gain"] / games,
                "avg_tk": a["sum_team_kill"] / games,
                "avg_kill": a["sum_player_kill"] / games,
                "rank_score": max(0.0, min(100.0, (1.0 - ((avg_rank - 1.0) / 23.0)) * 100.0)),
            }
        )

    if not raw_items:
        return {"total_games": totals, "count": 0, "items": []}

    damage_scores = _percentile_scores([r["avg_damage"] for r in raw_items])
    rp_scores = _percentile_scores([r["avg_rp_gain"] for r in raw_items])

    items = []
    for i, r in enumerate(raw_items):
        tier_score = (
            0.30 * r["win_rate_pct"]
            + 0.25 * r["top3_rate_pct"]
            + 0.25 * r["rank_score"]
            + 0.15 * damage_scores[i]
            + 0.05 * rp_scores[i]
        )
        items.append(
            {
                "character_num": r["character_num"],
                "character_name": r["character_name"],
                "games": r["games"],
                "pick_rate_pct": round(r["pick_rate_pct"], 2),
                "win_rate_pct": round(r["win_rate_pct"], 2),
                "top3_rate_pct": round(r["top3_rate_pct"], 2),
                "avg_rank": round(r["avg_rank"], 2),
                "avg_damage": round(r["avg_damage"], 2),
                "avg_damage_to_monster": round(r["avg_damage_to_monster"], 2),
                "avg_rp_gain": round(r["avg_rp_gain"], 2),
                "avg_tk": round(r["avg_tk"], 2),
                "avg_kill": round(r["avg_kill"], 2),
                "tier_score": round(tier_score, 2),
                "tier_grade": _tier_grade(tier_score),
            }
        )

    items.sort(key=lambda x: (x["tier_score"], x["games"]), reverse=True)
    return {
        "total_games": totals,
        "count": min(len(items), limit),
        "items": items[:limit],
    }
