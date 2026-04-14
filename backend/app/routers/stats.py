from __future__ import annotations

from collections import defaultdict
from fastapi import APIRouter, HTTPException, Query

from ..clients.supabase_client import get_supabase_client
from ..core.config import settings
from ..core.redis import cache_get, cache_set
from ..data.weapon_type_ko import (
    build_best_weapon_code_to_ko_db_first,
    resolve_weapon_display_name_for_stats,
    weapon_code_to_ko_map_from_db_rows,
)

router = APIRouter()

# Eternal Return API characterNum (027.Alex). DB에서 이름 매칭 실패 시 폴백.
ALEX_CHARACTER_NUM_FALLBACK = 27


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


def _row_get(row: dict, *keys: str, default: object | None = None) -> object | None:
    """Supabase 컬럼이 snake_case(레거시 DB) 또는 camelCase(schema.sql)일 때 모두 대응."""
    for k in keys:
        if k in row and row[k] is not None:
            return row[k]
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


def _resolve_alex_character_num(chars: list[dict]) -> int | None:
    """알렉스 characterNum (무기 통합 표시용). DB에 없으면 None."""
    for c in chars:
        num = _to_int(_row_get(c, "characterNum", "character_num"), -1)
        if num < 0:
            continue
        nko = str(_row_get(c, "nameKo", "name_ko") or "").strip()
        nen = str(c.get("name") or "").strip().lower()
        if nko == "알렉스" or nen == "alex":
            return num
    return None


def _tier_grade(score: float) -> str:
    if score >= 60:
        return "S+"
    if score >= 57:
        return "S"
    if score >= 53:
        return "A"
    if score >= 46:
        return "B"
    if score >= 40:
        return "C"
    return "D"


@router.get("/characters")
async def get_character_stats(
    minGames: int = Query(10, ge=1, le=10000),
    limit: int = Query(100, ge=1, le=300),
):
    """
    캐릭터 통계:
    - 평균 데미지(=damageToPlayer)
    - 평균 동물 딜량(damageToMonster)
    - 픽률/승률/top3/평균순위
    - 평균 RP 획득량(mmr_gain), 평균 TK(team_kill), 평균 킬(player_kill)
    """
    cache_key = f"stats:characters:minGames={minGames}:limit={limit}"
    try:
        cached = await cache_get(cache_key)
        if isinstance(cached, dict):
            return cached
    except Exception:
        # Cache failure should not block stats response.
        pass

    try:
        # 운영 DB는 snake_case(game_id, …). camelCase 스키마와 병행 시 _row_get 으로 양쪽 키 처리.
        games_rows = _fetch_all_rows("games", "game_id,matching_mode,matching_team_mode")
        ranked_squad_game_ids = {
            _to_int(_row_get(g, "gameId", "game_id"))
            for g in games_rows
            if _to_int(_row_get(g, "matchingMode", "matching_mode")) == 3
            and _to_int(_row_get(g, "matchingTeamMode", "matching_team_mode")) == 3
        }
        rows = _fetch_all_rows(
            "game_details",
            "game_id,character_num,best_weapon,game_rank,victory,"
            "damage_to_player,damage_to_monster,mmr_gain,team_kill,player_kill",
        )
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"games/game_details 조회 실패: {e}")

    # 무기 코드 → 한글명: Supabase weapon 테이블 우선, 없는 코드만 ER API/정적 맵.
    # 참고: 집계 키는 game_details.best_weapon. character.masteryWeaponCodes 는 통계 집계에 미사용.
    try:
        weapon_rows = _fetch_all_rows("weapon", "id,name,nameEn")
    except Exception:
        weapon_rows = []
    weapon_name_map = build_best_weapon_code_to_ko_db_first(
        weapon_code_to_ko_map_from_db_rows(weapon_rows),
        settings.er_api_base_url,
        settings.er_api_key,
    )

    rows = [
        r for r in rows if _to_int(_row_get(r, "gameId", "game_id")) in ranked_squad_game_ids
    ]

    if not rows:
        return {"totalGames": 0, "count": 0, "items": []}

    char_rows: list[dict] = []
    try:
        char_rows = _fetch_all_rows("character", "name,name_ko,nameKo,characterNum")
    except Exception:
        pass
    alex_num = _resolve_alex_character_num(char_rows)
    if alex_num is None:
        alex_num = ALEX_CHARACTER_NUM_FALLBACK
    # 알렉스는 유일하게 복수 무기 타입을 쓰는 실험체 → 무기 구분 없이 하나의 행으로 집계
    ALEX_MERGED_WEAPON_KEY = 0

    totals = len(rows)
    agg: dict[tuple[int, int], dict[str, float]] = defaultdict(
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

    # 캐릭터 내 무기 픽률 계산용 분모
    char_totals: dict[int, int] = defaultdict(int)

    for r in rows:
        c = _to_int(_row_get(r, "characterNum", "character_num"), -1)
        w = _to_int(_row_get(r, "bestWeapon", "best_weapon"), -1)
        if c < 0 or w < 0:
            continue
        if c == alex_num:
            w = ALEX_MERGED_WEAPON_KEY
        key = (c, w)
        a = agg[key]
        a["games"] += 1
        char_totals[c] += 1
        a["wins"] += 1 if _to_int(_row_get(r, "victory")) == 1 else 0
        a["top3"] += 1 if _to_int(_row_get(r, "gameRank", "game_rank"), 999) <= 3 else 0
        a["sum_rank"] += _to_num(_row_get(r, "gameRank", "game_rank"))
        a["sum_damage_to_player"] += _to_num(_row_get(r, "damageToPlayer", "damage_to_player"))
        a["sum_damage_to_monster"] += _to_num(_row_get(r, "damageToMonster", "damage_to_monster"))
        a["sum_mmr_gain"] += _to_num(_row_get(r, "mmrGain", "mmr_gain"))
        a["sum_team_kill"] += _to_num(_row_get(r, "teamKill", "team_kill"))
        a["sum_player_kill"] += _to_num(_row_get(r, "playerKill", "player_kill"))

    # character 테이블: characterNum ↔ 표시명 (nameKo 우선, 없으면 name)
    char_name_map: dict[int, str] = {}
    for c in char_rows:
        num = _to_int(_row_get(c, "characterNum", "character_num"), -1)
        if num < 0:
            continue
        ko = str(_row_get(c, "nameKo", "name_ko") or "").strip()
        fallback = str(c.get("name") or "").strip()
        char_name_map[num] = ko if ko else fallback

    # 글로벌 평균 (베이지안 보정)
    global_win = (sum(1 for r in rows if _to_int(r.get("victory")) == 1) / totals) * 100.0
    global_top3 = (
        sum(1 for r in rows if _to_int(_row_get(r, "gameRank", "game_rank"), 999) <= 3) / totals
    ) * 100.0
    k = 70.0

    raw_items: list[dict] = []
    for (character_num, weapon_id), a in agg.items():
        games = int(a["games"])
        if games < minGames:
            continue
        avg_rank = a["sum_rank"] / games
        win_rate = (a["wins"] / games) * 100
        top3_rate = (a["top3"] / games) * 100
        pick_rate_pct = (games / totals) * 100
        if character_num == alex_num:
            weapon_pick_rate_in_character = 100.0
        else:
            weapon_pick_rate_in_character = (games / max(char_totals.get(character_num, 1), 1)) * 100

        adj_win = (games / (games + k)) * win_rate + (k / (games + k)) * global_win
        adj_top3 = (games / (games + k)) * top3_rate + (k / (games + k)) * global_top3
        pick_penalty = min(5.0, max(0.0, (1.0 - pick_rate_pct) * 5.0))

        raw_items.append(
            {
                "characterNum": character_num,
                "weaponId": weapon_id,
                "weaponName": (
                    "복합 무기"
                    if character_num == alex_num and weapon_id == ALEX_MERGED_WEAPON_KEY
                    else resolve_weapon_display_name_for_stats(
                        character_num, weapon_id, weapon_name_map
                    )
                ),
                "characterName": char_name_map.get(character_num),
                "games": games,
                "pickRatePct": pick_rate_pct,
                "weaponPickRateInCharacterPct": weapon_pick_rate_in_character,
                "winRatePct": win_rate,
                "top3RatePct": top3_rate,
                "adjWinRatePct": adj_win,
                "adjTop3RatePct": adj_top3,
                "avgRank": avg_rank,
                "avgDamage": a["sum_damage_to_player"] / games,
                "avgDamageToMonster": a["sum_damage_to_monster"] / games,
                "avgRpGain": a["sum_mmr_gain"] / games,
                "avgTk": a["sum_team_kill"] / games,
                "avgKill": a["sum_player_kill"] / games,
                "pickPenalty": pick_penalty,
                "rankScore": max(0.0, min(100.0, (1.0 - ((avg_rank - 1.0) / 23.0)) * 100.0)),
            }
        )

    if not raw_items:
        return {"totalGames": totals, "count": 0, "items": []}

    damage_scores = _percentile_scores([r["avgDamage"] for r in raw_items])
    rp_scores = _percentile_scores([r["avgRpGain"] for r in raw_items])

    items = []
    for i, r in enumerate(raw_items):
        tier_score_val = (
            0.30 * r["adjWinRatePct"]
            + 0.25 * r["adjTop3RatePct"]
            + 0.25 * r["rankScore"]
            + 0.15 * damage_scores[i]
            + 0.05 * rp_scores[i]
        )
        tier_score_val = max(0.0, min(100.0, tier_score_val - r["pickPenalty"]))
        items.append(
            {
                "characterNum": r["characterNum"],
                "weaponId": r["weaponId"],
                "weaponName": r["weaponName"],
                "characterName": r["characterName"],
                "games": r["games"],
                "pickRatePct": round(r["pickRatePct"], 2),
                "weaponPickRateInCharacterPct": round(r["weaponPickRateInCharacterPct"], 2),
                "winRatePct": round(r["winRatePct"], 2),
                "top3RatePct": round(r["top3RatePct"], 2),
                "adjWinRatePct": round(r["adjWinRatePct"], 2),
                "adjTop3RatePct": round(r["adjTop3RatePct"], 2),
                "avgRank": round(r["avgRank"], 2),
                "avgDamage": round(r["avgDamage"], 2),
                "avgDamageToMonster": round(r["avgDamageToMonster"], 2),
                "avgRpGain": round(r["avgRpGain"], 2),
                "avgTk": round(r["avgTk"], 2),
                "avgKill": round(r["avgKill"], 2),
                "pickPenalty": round(r["pickPenalty"], 2),
                "tierScore": round(tier_score_val, 2),
                "tierGrade": _tier_grade(tier_score_val),
            }
        )

    items.sort(key=lambda x: (x["tierScore"], x["games"]), reverse=True)
    result = {
        "totalGames": totals,
        "count": min(len(items), limit),
        "items": items[:limit],
    }
    try:
        await cache_set(cache_key, result)
    except Exception:
        pass
    return result
