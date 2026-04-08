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
    user_id = "1ZY92-p2dW3bzENWJz7NlR1ig4Q24Lp95PZ8Y8byDsirTt6oMKkw_kgk3aUk"
    try:
        print(f"Fetching games for userId: {user_id}...")
        games_data = await client.get_user_games_by_user_id(user_id)
        
        if games_data.get("code") != 200:
            print(f"Error fetching games: {games_data}")
            return
        
        games = games_data.get("userGames", [])
        print(f"Found {len(games)} games.")
        
        with open("/Users/hyeonmin/Documents/GitHub/ERGG/latest_user_games.json", "w", encoding="utf-8") as f:
            json.dump(games, f, indent=2, ensure_ascii=False)
        
        print("Games saved to /Users/hyeonmin/Documents/GitHub/ERGG/latest_user_games.json")
        
        # Print a snippet of the first game for immediate analysis
        if games:
            print("\n--- First Game Snippet ---")
            print(json.dumps(games[0], indent=2, ensure_ascii=False)[:2000] + "...")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        await client.aclose()

if __name__ == "__main__":
    asyncio.run(main())
