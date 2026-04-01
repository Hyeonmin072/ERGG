from __future__ import annotations

from typing import Any
from ..clients.er_api_client import get_er_client
from ..clients.supabase_client import get_supabase_client


def _build_game_row(g: dict[str, Any]) -> dict[str, Any]:
    """Supabase `games` — 컬럼명 ER API camelCase와 동일."""
    return {
        "gameId": g.get("gameId"),
        "seasonId": g.get("seasonId", 0),
        "matchingMode": g.get("matchingMode", 0),
        "matchingTeamMode": g.get("matchingTeamMode", 0),
        "serverName": g.get("serverName", "Global"),
        "versionMajor": g.get("versionMajor", 0),
        "versionMinor": g.get("versionMinor", 0),
        "startDtm": g.get("startDtm"),
        "duration": g.get("duration", 0),
        "matchSize": g.get("matchSize", 0),
        "botAdded": g.get("botAdded", 0),
        "botRemain": g.get("botRemain", 0),
        "restrictedAreaAccelerated": g.get("restrictedAreaAccelerated", 0),
        "safeAreas": g.get("safeAreas", 0),
        "mmrAvg": g.get("mmrAvg", 0),
    }


def _build_game_detail_row(user_id: str, g: dict[str, Any]) -> dict[str, Any]:
    """Supabase `game_details` — 컬럼명 ER API와 동일."""
    return {
        "gameId": g.get("gameId"),
        "userId": user_id,
        "userNum": g.get("userNum"),
        "characterNum": g.get("characterNum", 0),
        "characterLevel": g.get("characterLevel", 0),
        "skinCode": g.get("skinCode", 0),
        "gameRank": g.get("gameRank", 0),
        "victory": g.get("victory", 0),
        "giveUp": g.get("giveUp", 0),
        "teamSpectator": g.get("teamSpectator", 0),
        "teamNumber": g.get("teamNumber", 0),
        "preMade": g.get("preMade", 0),
        "escapeState": g.get("escapeState", 0),
        "playerKill": g.get("playerKill", 0),
        "playerAssistant": g.get("playerAssistant", 0),
        "monsterKill": g.get("monsterKill", 0),
        "playerDeaths": g.get("playerDeaths", 0),
        "teamKill": g.get("teamKill", 0),
        "totalFieldKill": g.get("totalFieldKill", 0),
        "bestWeapon": g.get("bestWeapon", 0),
        "bestWeaponLevel": g.get("bestWeaponLevel", 0),
        "playTime": g.get("playTime", 0),
        "watchTime": g.get("watchTime", 0),
        "totalTime": g.get("totalTime", 0),
        "survivableTime": g.get("survivableTime", 0),
        "mmrBefore": g.get("mmrBefore", 0),
        "mmrGain": g.get("mmrGain", 0),
        "mmrAfter": g.get("mmrAfter", 0),
        "rankPoint": g.get("rankPoint", 0),
        "maxHp": g.get("maxHp", 0),
        "maxSp": g.get("maxSp", 0),
        "attackPower": g.get("attackPower", 0),
        "defense": g.get("defense", 0),
        "attackSpeed": g.get("attackSpeed", 0),
        "moveSpeed": g.get("moveSpeed", 0),
        "sightRange": g.get("sightRange", 0),
        "attackRange": g.get("attackRange", 0),
        "damageToPlayer": g.get("damageToPlayer", 0),
        "damageFromPlayer": g.get("damageFromPlayer", 0),
        "damageToMonster": g.get("damageToMonster", 0),
        "damageFromMonster": g.get("damageFromMonster", 0),
        "healAmount": g.get("healAmount", 0),
        "protectAbsorb": g.get("protectAbsorb", 0),
        "ccTimeToPlayer": g.get("ccTimeToPlayer", 0),
        "craftUncommon": g.get("craftUncommon", 0),
        "craftRare": g.get("craftRare", 0),
        "craftEpic": g.get("craftEpic", 0),
        "craftLegend": g.get("craftLegend", 0),
        "craftMythic": g.get("craftMythic", 0),
        "gainExp": g.get("gainExp", 0),
        "baseExp": g.get("baseExp", 0),
        "bonusExp": g.get("bonusExp", 0),
        "bonusCoin": g.get("bonusCoin", 0),
        "routeIdOfStart": g.get("routeIdOfStart", 0),
        "routeSlotId": g.get("routeSlotId", 0),
        "placeOfStart": str(g.get("placeOfStart", "")),
        "battleZonePlayerKill": g.get("battleZonePlayerKill", 0),
        "battleZoneDeaths": g.get("battleZoneDeaths", 0),
        "serverName": g.get("serverName", "Global"),
        "language": g.get("language", "ko"),
        "expireDtm": g.get("expireDtm"),
        "equipment": g.get("equipment", {}),
        "equipmentGrade": g.get("equipmentGrade", {}),
        "masteryLevel": g.get("masteryLevel", {}),
        "skillLevelInfo": g.get("skillLevelInfo", {}),
        "skillOrderInfo": g.get("skillOrderInfo", {}),
        "killMonsters": g.get("killMonsters", {}),
        "traitFirstCore": g.get("traitFirstCore", 0),
        "traitFirstSub": g.get("traitFirstSub", []),
        "traitSecondSub": g.get("traitSecondSub", []),
        "foodCraftCount": g.get("foodCraftCount", []),
        "totalVFCredits": g.get("totalVFCredits", []),
        "usedVFCredits": g.get("usedVFCredits", []),
        "scoredPoint": g.get("scoredPoint", []),
        "creditSource": g.get("creditSource", {}),
        "eventMissionResult": g.get("eventMissionResult", {}),
        "itemTransferredConsole": g.get("itemTransferredConsole", []),
        "itemTransferredDrone": g.get("itemTransferredDrone", []),
        "collectItemForLog": g.get("collectItemForLog", []),
        "equipFirstItemForLog": g.get("equipFirstItemForLog", {}),
        "boughtInfusion": g.get("boughtInfusion", {}),
        "killDetails": g.get("killDetails", "{}"),
        "deathDetails": g.get("deathDetails", "{}"),
    }


async def sync_user_games_by_user_id_to_supabase(
    *,
    user_id: str,
    limit: int = 20,
) -> dict[str, Any]:
    """
    userId 기반으로 게임을 조회해 Supabase에 저장.
    next 커서를 이용해 유저당 최대 limit 게임 수집.
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
    nickname = first.get("nickname")

    if not nickname:
        try:
            profile = await client.get_user_by_user_id(user_id)
            if profile.get("code") == 200:
                nickname = (profile.get("user") or {}).get("nickname")
        except Exception:
            pass

    player_row = {
        "userId": user_id,
        "userNum": first.get("userNum"),
        "nickname": nickname or user_id,
        "accountLevel": first.get("accountLevel", 0),
        "rankPoint": first.get("rankPoint", 0),
        "serverName": first.get("serverName", "Global"),
    }
    sb.table("players").upsert(player_row, on_conflict="userId").execute()

    game_rows = [_build_game_row(g) for g in user_games if g.get("gameId")]
    gd_rows = [_build_game_detail_row(user_id, g) for g in user_games if g.get("gameId")]

    if game_rows:
        sb.table("games").upsert(game_rows, on_conflict="gameId").execute()
    if gd_rows:
        sb.table("game_details").upsert(gd_rows, on_conflict="gameId,userId").execute()

    return {
        "saved": len(gd_rows),
        "games": len(game_rows),
        "nickname": player_row["nickname"],
        "user_id": user_id,
        "next_cursor_used": bool(next_cursor),
    }
