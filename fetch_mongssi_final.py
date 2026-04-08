import asyncio
import sys
import os
import json
from pathlib import Path

# Set PYTHONPATH to include the backend directory
sys.path.append("/Users/hyeonmin/Documents/GitHub/ERGG/backend")

from app.clients.er_api_client import get_er_client

async def main():
    client = get_er_client()
    # Use the userId found via raw curl to bypass the nickname search issue
    user_id = "DCShVtMvVSk5TeHYjTcOSh04jlVBzXlq94ujLabny-gNg1W44v2QJJw"
    try:
        print(f"Fetching games for userId: {user_id} (몽씨)...")
        games_data = await client.get_user_games_by_user_id(user_id)
        
        if games_data.get("code") != 200:
            print(f"Error fetching games: {games_data}")
            return
        
        games = games_data.get("userGames", [])
        print(f"Found {len(games)} games.")
        
        if games:
            # Basic stats aggregation
            ranks = [g.get("gameRank", 0) for g in games]
            kills = [g.get("playerKill", 0) for g in games]
            assists = [g.get("playerAssistant", 0) for g in games]
            damage = [g.get("damageToPlayer", 0) for g in games]
            
            import numpy as np
            summary = {
                "total_games": len(games),
                "avg_rank": float(np.mean(ranks)) if ranks else 0,
                "avg_kills": float(np.mean(kills)) if kills else 0,
                "avg_assists": float(np.mean(assists)) if assists else 0,
                "avg_damage": float(np.mean(damage)) if damage else 0,
            }
            print("\n--- Summary Stats for 몽씨 ---")
            print(json.dumps(summary, indent=2))
            
            print("\n--- Latest Game Snippet ---")
            print(json.dumps(games[0], indent=2, ensure_ascii=False)[:1000] + "...")
        else:
            print("No games found for this user.")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        await client.aclose()

if __name__ == "__main__":
    asyncio.run(main())
