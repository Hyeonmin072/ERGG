from __future__ import annotations

from typing import Any

from ..clients.er_api_client import get_er_client
from ..clients.supabase_client import get_supabase_client

# ER API: matchingMode 3 = rank (excludes normal mode 2, etc.)
RANK_MATCHING_MODE = 3
# Safety cap: rank-only filter may need many pages (~10 games/page, 1 req/s in client)
_MAX_RANK_FETCH_PAGES = 80


def _nickname_key(nickname: str) -> str:
    """lower(trim(nickname)) — same as migration backfill."""
    return (nickname or "").strip().lower()


def _latest_user_game_for_snapshot(user_games: list[dict[str, Any]]) -> dict[str, Any]:
    """Pick latest match by startDtm then gameId for players.rank_point snapshot."""
    if not user_games:
        return {}
    return max(
        user_games,
        key=lambda g: (
            str(g.get("startDtm") or ""),
            int(g.get("gameId") or 0),
        ),
    )


def _release_nickname_key_for_other_users(
    sb: Any,
    *,
    nickname_key: str,
    user_id: str,
) -> bool:
    """Nickname recycled: set nickname_key=NULL on other player rows only."""
    nickname_key = (nickname_key or "").strip()
    user_id = (user_id or "").strip()
    if not nickname_key or not user_id:
        return True
    try:
        sb.table("players").update({"nickname_key": None}).eq("nickname_key", nickname_key).neq(
            "user_id", user_id
        ).execute()
        return True
    except Exception as e:
        err = str(e).lower()
        if "nickname_key" in err or "pgrst204" in err or "column" in err:
            return False
        raise


def _build_game_row(g: dict[str, Any]) -> dict[str, Any]:
    """Supabase `games` — snake_case 컬럼명."""
    return {
        "game_id": g.get("gameId"),
        "season_id": g.get("seasonId", 0),
        "matching_mode": g.get("matchingMode", 0),
        "matching_team_mode": g.get("matchingTeamMode", 0),
        "server_name": g.get("serverName", "Global"),
        "version_major": g.get("versionMajor", 0),
        "version_minor": g.get("versionMinor", 0),
        "start_dtm": g.get("startDtm"),
        "duration": g.get("duration", 0),
        "match_size": g.get("matchSize", 0),
        "bot_added": g.get("botAdded", 0),
        "bot_remain": g.get("botRemain", 0),
        "restricted_area_accelerated": g.get("restrictedAreaAccelerated", 0),
        "safe_areas": g.get("safeAreas", 0),
        "mmr_avg": g.get("mmrAvg", 0),
    }


def _build_game_detail_row(user_id: str, g: dict[str, Any]) -> dict[str, Any]:
    """Supabase `game_details` — snake_case 컬럼명."""
    return {
        "game_id": g.get("gameId"),
        "user_id": user_id,
        "character_num": g.get("characterNum", 0),
        "character_level": g.get("characterLevel", 0),
        "skin_code": g.get("skinCode", 0),
        "game_rank": g.get("gameRank", 0),
        "victory": g.get("victory", 0),
        "give_up": g.get("giveUp", 0),
        "team_spectator": g.get("teamSpectator", 0),
        "team_number": g.get("teamNumber", 0),
        "pre_made": g.get("preMade", 0),
        "escape_state": g.get("escapeState", 0),
        "player_kill": g.get("playerKill", 0),
        "player_assistant": g.get("playerAssistant", 0),
        "monster_kill": g.get("monsterKill", 0),
        "player_deaths": g.get("playerDeaths", 0),
        "team_kill": g.get("teamKill", 0),
        "total_field_kill": g.get("totalFieldKill", 0),
        "best_weapon": g.get("bestWeapon", 0),
        "best_weapon_level": g.get("bestWeaponLevel", 0),
        "play_time": g.get("playTime", 0),
        "watch_time": g.get("watchTime", 0),
        "total_time": g.get("totalTime", 0),
        "survivable_time": g.get("survivableTime", 0),
        "mmr_before": g.get("mmrBefore", 0),
        "mmr_gain": g.get("mmrGain", 0),
        "mmr_after": g.get("mmrAfter", 0),
        "rank_point": g.get("rankPoint", 0),
        "max_hp": g.get("maxHp", 0),
        "max_sp": g.get("maxSp", 0),
        "attack_power": g.get("attackPower", 0),
        "defense": g.get("defense", 0),
        "attack_speed": g.get("attackSpeed", 0),
        "move_speed": g.get("moveSpeed", 0),
        "sight_range": g.get("sightRange", 0),
        "attack_range": g.get("attackRange", 0),
        "damage_to_player": g.get("damageToPlayer", 0),
        "damage_from_player": g.get("damageFromPlayer", 0),
        "damage_to_monster": g.get("damageToMonster", 0),
        "damage_from_monster": g.get("damageFromMonster", 0),
        "heal_amount": g.get("healAmount", 0),
        "protect_absorb": g.get("protectAbsorb", 0),
        "cc_time_to_player": g.get("ccTimeToPlayer", 0),
        "craft_uncommon": g.get("craftUncommon", 0),
        "craft_rare": g.get("craftRare", 0),
        "craft_epic": g.get("craftEpic", 0),
        "craft_legend": g.get("craftLegend", 0),
        "craft_mythic": g.get("craftMythic", 0),
        "gain_exp": g.get("gainExp", 0),
        "base_exp": g.get("baseExp", 0),
        "bonus_exp": g.get("bonusExp", 0),
        "bonus_coin": g.get("bonusCoin", 0),
        "route_id_of_start": g.get("routeIdOfStart", 0),
        "route_slot_id": g.get("routeSlotId", 0),
        "place_of_start": str(g.get("placeOfStart", "")),
        "battle_zone_player_kill": g.get("battleZonePlayerKill", 0),
        "battle_zone_deaths": g.get("battleZoneDeaths", 0),
        "server_name": g.get("serverName", "Global"),
        "language": g.get("language", "ko"),
        "expire_dtm": g.get("expireDtm"),
        "equipment": g.get("equipment", {}),
        "equipment_grade": g.get("equipmentGrade", {}),
        "mastery_level": g.get("masteryLevel", {}),
        "skill_level_info": g.get("skillLevelInfo", {}),
        "skill_order_info": g.get("skillOrderInfo", {}),
        "kill_monsters": g.get("killMonsters", {}),
        "trait_first_core": g.get("traitFirstCore", 0),
        "trait_first_sub": g.get("traitFirstSub", []),
        "trait_second_sub": g.get("traitSecondSub", []),
        "food_craft_count": g.get("foodCraftCount", []),
        "total_vf_credits": g.get("totalVFCredits", []),
        "used_vf_credits": g.get("usedVFCredits", []),
        "scored_point": g.get("scoredPoint", []),
        "credit_source": g.get("creditSource", {}),
        "event_mission_result": g.get("eventMissionResult", {}),
        "item_transferred_console": g.get("itemTransferredConsole", []),
        "item_transferred_drone": g.get("itemTransferredDrone", []),
        "collect_item_for_log": g.get("collectItemForLog", []),
        "equip_first_item_for_log": g.get("equipFirstItemForLog", {}),
        "bought_infusion": g.get("boughtInfusion", {}),
        "kill_details": g.get("killDetails", "{}"),
        "death_details": g.get("deathDetails", "{}"),
    }


async def sync_user_games_by_user_id_to_supabase(
    *,
    user_id: str,
    limit: int = 20,
    is_in1000: bool = False,
    in1000_columns_available: bool = True,
    touch_in1000_fields: bool = True,
) -> dict[str, Any]:
    """
    Rank-only (matchingMode=3): paginate with next until limit rank games or API ends.
    Upsert to Supabase.

    touch_in1000_fields:
      True  — in1000 batch: write is_in1000 / in1000_sync_at when columns exist.
      False — search/casual save: update nickname/RP only; do not change in1000 flags.

    nickname_key: only this user_id keeps the key; others get NULL (nickname recycle).
    """
    client = get_er_client()
    sb = get_supabase_client()

    target = max(1, min(limit, 100))
    next_cursor: str | None = None
    collected: list[dict[str, Any]] = []

    seen_game_ids: set[int] = set()
    pages_fetched = 0

    while len(collected) < target and pages_fetched < _MAX_RANK_FETCH_PAGES:
        resp = await client.get_user_games_by_user_id(user_id=user_id, next_cursor=next_cursor)
        pages_fetched += 1
        if resp.get("code") != 200:
            raise RuntimeError(f"userId 게임 목록 조회 실패: code={resp.get('code')}")

        batch = resp.get("userGames", []) or []
        if not batch:
            break

        for g in batch:
            if int(g.get("matchingMode") or 0) != RANK_MATCHING_MODE:
                continue
            gid = g.get("gameId")
            if gid is None:
                continue
            try:
                gid_int = int(gid)
            except (TypeError, ValueError):
                continue
            if gid_int in seen_game_ids:
                continue
            seen_game_ids.add(gid_int)
            collected.append(g)
            if len(collected) >= target:
                break

        if len(collected) >= target:
            break

        next_cursor = resp.get("next")
        if not next_cursor:
            break

    user_games = collected
    if not user_games:
        return {
            "saved": 0,
            "games": 0,
            "message": "No ranked games to save (matchingMode=3).",
            "user_id": user_id,
            "pages_fetched": pages_fetched,
        }

    latest = _latest_user_game_for_snapshot(user_games)
    first = user_games[0]
    nickname = latest.get("nickname") or first.get("nickname")

    if not nickname:
        try:
            profile = await client.get_user_by_user_id(user_id)
            if profile.get("code") == 200:
                nickname = (profile.get("user") or {}).get("nickname")
        except Exception:
            pass

    from datetime import datetime, timezone

    display_nickname = nickname or user_id
    nk = _nickname_key(display_nickname)
    nk_col_ok = _release_nickname_key_for_other_users(sb, nickname_key=nk, user_id=user_id)

    player_row: dict[str, Any] = {
        "user_id": user_id,
        "nickname": display_nickname,
        "account_level": latest.get("accountLevel", 0),
        "rank_point": latest.get("rankPoint", 0),
        "server_name": latest.get("serverName", "Global"),
    }
    if nk and nk_col_ok:
        player_row["nickname_key"] = nk
    if touch_in1000_fields and in1000_columns_available:
        player_row["is_in1000"] = is_in1000
        if is_in1000:
            player_row["in1000_sync_at"] = datetime.now(timezone.utc).isoformat()

    sb.table("players").upsert(player_row, on_conflict="user_id").execute()

    game_rows = [_build_game_row(g) for g in user_games if g.get("gameId")]
    gd_rows = [_build_game_detail_row(user_id, g) for g in user_games if g.get("gameId")]

    if game_rows:
        sb.table("games").upsert(game_rows, on_conflict="game_id").execute()
    if gd_rows:
        sb.table("game_details").upsert(gd_rows, on_conflict="game_id,user_id").execute()

    return {
        "saved": len(gd_rows),
        "games": len(game_rows),
        "nickname": player_row["nickname"],
        "user_id": user_id,
        "pages_fetched": pages_fetched,
        "rank_matching_mode": RANK_MATCHING_MODE,
    }
