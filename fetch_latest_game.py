import asyncio
import sys
import os
from pathlib import Path

# Set PYTHONPATH to include the backend directory
sys.path.append("/Users/hyeonmin/Documents/GitHub/ERGG/backend")

from app.clients.er_api_client import get_er_client

async def main():
    client = get_er_client()
    try:
        # 1. Search for user by nickname
        print("Searching for user '김현민'...")
        user_data = await client.search_by_nickname("김현민")
        if user_data.get("code") != 200:
            print(f"User search failed: {user_data}")
            return
        
        # Find the first matching user
        users = user_data.get("users", [])
        if not users:
            print("No users found with nickname '김현민'.")
            return
        
        # In case of multiple results, just take the first one for now
        user = users[0]
        user_id = user.get("userId")
        nickname = user.get("nickname")
        print(f"Found user: {nickname} ({user_id})")

        # 2. Get recent games
        print("Fetching recent games...")
        games_data = await client.get_user_games_by_user_id(user_id)
        if games_data.get("code") != 200:
            print(f"Fetching games failed: {games_data}")
            return
        
        games = games_data.get("userGames", [])
        if not games:
            print("No games found for this user.")
            return
        
        # Take the most recent game
        latest_game_id = games[0].get("gameId")
        print(f"Most recent game ID: {latest_game_id}")

        # 3. Get game detail
        print("Fetching game details...")
        game_detail = await client.get_game_detail(latest_game_id)
        print("\n--- Latest Game Detail ---")
        import json
        print(json.dumps(game_detail, indent=2, ensure_ascii=False))

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        await client.aclose()

if __name__ == "__main__":
    asyncio.run(main())
