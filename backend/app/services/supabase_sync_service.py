from __future__ import annotations

from typing import Any
from ..clients.er_api_client import get_er_client
from ..clients.supabase_client import get_supabase_client


def _build_game_row(g: dict[str, Any]) -> dict[str, Any]:
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


def _build_game_detail_row(user_id: str, user_num: int | None, g: dict[str, Any]) -> dict[str, Any]:
    return {
        "game_id": g.get("gameId"),
        "user_id": user_id,
        "user_num": user_num,
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


async def sync_user_games_to_supabase(
    *,
    user_num: int,
    nickname: str | None = None,
    limit: int = 20,
) -> dict[str, Any]:
    client = get_er_client()
    sb = get_supabase_client()

    games_resp = await client.get_user_games(user_num)
    if games_resp.get("code") != 200:
        raise RuntimeError("게임 목록 조회 실패")

    user_games: list[dict[str, Any]] = games_resp.get("userGames", [])[: max(1, min(limit, 100))]
    if not user_games:
        return {"saved": 0, "games": 0, "message": "저장할 게임 데이터가 없습니다."}

    first = user_games[0]
    user_id = f"usernum:{user_num}"
    player_row = {
        "user_id": user_id,
        "user_num": user_num,
        "nickname": nickname or first.get("nickname", str(user_num)),
        "account_level": first.get("accountLevel", 0),
        "rank_point": first.get("rankPoint", 0),
        "server_name": first.get("serverName", "Global"),
    }
    sb.table("players").upsert(player_row, on_conflict="user_id").execute()

    game_rows = [_build_game_row(g) for g in user_games if g.get("gameId")]
    gd_rows = [_build_game_detail_row(user_id, user_num, g) for g in user_games if g.get("gameId")]

    if game_rows:
        sb.table("games").upsert(game_rows, on_conflict="game_id").execute()
    if gd_rows:
        sb.table("game_details").upsert(gd_rows, on_conflict="game_id,user_id").execute()

    return {
        "saved": len(gd_rows),
        "games": len(game_rows),
        "user_id": user_id,
        "user_num": user_num,
        "nickname": player_row["nickname"],
    }


async def resolve_user_num_from_user_id(user_id: str) -> tuple[int, str | None]:
    client = get_er_client()
    data = await client.get_user_by_user_id(user_id)
    if data.get("code") != 200:
        raise RuntimeError("userId로 userNum 조회 실패")
    user = data.get("user", {})
    user_num = user.get("userNum")
    if not user_num:
        raise RuntimeError("응답에 userNum이 없습니다.")
    return int(user_num), user.get("nickname")


async def sync_user_games_by_user_id_to_supabase(
    *,
    user_id: str,
    limit: int = 20,
) -> dict[str, Any]:
    """
    userId 기반으로 게임을 조회해 Supabase에 저장.
    요구사항: next 커서를 이용해 유저당 20게임 수집.
    """
    client = get_er_client()
    sb = get_supabase_client()

    target = max(1, min(limit, 100))
    next_cursor: str | None = None
    collected: list[dict[str, Any]] = []

    while len(collected) < target:
        resp = await client.get_user_games_by_user_id(user_id=user_id, next_cursor=next_cursor)
        if resp.get("code") != 200:
            raise RuntimeError(f"userId 게임 목록 조회 실패: code={resp.get('code')}")

        batch = resp.get("userGames", []) or []
        if not batch:
            break

        collected.extend(batch)
        next_cursor = resp.get("next")
        if not next_cursor:
            break

    user_games = collected[:target]
    if not user_games:
        return {"saved": 0, "games": 0, "message": "저장할 게임 데이터가 없습니다.", "user_id": user_id}

    first = user_games[0]
    user_num = int(first.get("userNum") or 0)
    nickname = first.get("nickname")

    # uid 게임 응답에는 userNum이 없을 수 있어 보조 조회로 보완한다.
    if user_num <= 0:
        try:
            profile = await client.get_user_by_user_id(user_id)
            if profile.get("code") == 200:
                user_num = int((profile.get("user") or {}).get("userNum") or 0)
                if not nickname:
                    nickname = (profile.get("user") or {}).get("nickname")
        except Exception:
            user_num = 0

    # userId API가 userNum 조회를 지원하지 않는 경우, 닉네임 기반으로 1회 보조 조회
    if user_num <= 0 and nickname:
        by_nick = await client.search_by_nickname(nickname)
        if by_nick.get("code") == 200:
            user_num = int((by_nick.get("user") or {}).get("userNum") or 0)

    # user_id 중심 저장 구조이므로 userNum이 없어도 계속 진행한다.
    if user_num <= 0:
        user_num = None

    player_row = {
        "user_id": user_id,
        "user_num": user_num,
        "nickname": nickname or user_id,
        "account_level": first.get("accountLevel", 0),
        "rank_point": first.get("rankPoint", 0),
        "server_name": first.get("serverName", "Global"),
    }
    sb.table("players").upsert(player_row, on_conflict="user_id").execute()

    game_rows = [_build_game_row(g) for g in user_games if g.get("gameId")]
    gd_rows = [_build_game_detail_row(user_id, user_num, g) for g in user_games if g.get("gameId")]

    if game_rows:
        sb.table("games").upsert(game_rows, on_conflict="game_id").execute()
    if gd_rows:
        sb.table("game_details").upsert(gd_rows, on_conflict="game_id,user_id").execute()

    return {
        "saved": len(gd_rows),
        "games": len(game_rows),
        "user_num": user_num,
        "nickname": player_row["nickname"],
        "user_id": user_id,
        "next_cursor_used": bool(next_cursor),
    }
