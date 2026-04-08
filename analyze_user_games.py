import json
import numpy as np

def analyze_games():
    with open("/Users/hyeonmin/Documents/GitHub/ERGG/latest_user_games.json", "r", encoding="utf-8") as f:
        games = json.load(f)

    if not games:
        print("No games to analyze.")
        return

    # Basic stats aggregation
    ranks = [g.get("gameRank", 0) for g in games]
    kills = [g.get("playerKill", 0) for g in games]
    assists = [g.get("playerAssistant", 0) for g in games]
    damage = [g.get("damageToPlayer", 0) for g in games]
    survival_times = [g.get("survivableTime", 0) for g in games]
    chars = [g.get("characterNum", 0) for g in games]
    weapons = [g.get("bestWeapon", 0) for g in games]
    victories = [g.get("victory", 0) for g in games]

    summary = {
        "total_games": len(games),
        "avg_rank": np.mean(ranks) if ranks else 0,
        "avg_kills": np.mean(kills) if kills else 0,
        "avg_assists": np.mean(assists) if assists else 0,
        "avg_damage": np.mean(damage) if damage else 0,
        "avg_survival": np.mean(survival_times) if survival_times else 0,
        "win_rate": (sum(victories) / len(games)) * 100 if games else 0,
        "most_played_char": max(set(chars), key=chars.count) if chars else None,
        "most_used_weapon": max(set(weapons), key=weapons.count) if weapons else None,
    }

    print(json.dumps(summary, indent=2))

if __name__ == "__main__":
    analyze_games()
