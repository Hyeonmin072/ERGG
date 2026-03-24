"""
이터널리턴 Open API 클라이언트.
Rate Limit 대응: asyncio.Semaphore(1) + 1초 딜레이
"""
from __future__ import annotations
import asyncio
import httpx
from ..core.config import settings


_semaphore = asyncio.Semaphore(1)


class ErApiClient:
    BASE_URL = settings.er_api_base_url

    def __init__(self):
        self._client = httpx.AsyncClient(
            base_url=self.BASE_URL,
            headers={"x-api-key": settings.er_api_key},
            timeout=10.0,
        )

    async def _get(self, path: str, params: dict | None = None) -> dict:
        async with _semaphore:
            try:
                resp = await self._client.get(path, params=params)
                resp.raise_for_status()
                return resp.json()
            finally:
                await asyncio.sleep(1.0)  # Rate limit 대응

    async def search_by_nickname(self, nickname: str) -> dict:
        """닉네임으로 userNum 조회."""
        return await self._get("/v1/user/nickname", params={"query": nickname})

    async def get_user_stats(self, user_num: int, season_id: int) -> dict:
        """유저 랭크 스탯 조회."""
        return await self._get(f"/v1/user/stats/{user_num}/{season_id}")

    async def get_user_games(self, user_num: int, next_cursor: str | None = None) -> dict:
        """유저 게임 목록 조회 (최신순, cursor 페이지네이션)."""
        params = {}
        if next_cursor:
            params["next"] = next_cursor
        return await self._get(f"/v1/user/games/{user_num}", params=params)

    async def get_game_detail(self, game_id: int) -> dict:
        """특정 게임 상세 조회."""
        return await self._get(f"/v1/games/{game_id}")

    async def get_top_rank(self, season_id: int, team_mode: int) -> dict:
        """상위 랭킹 조회."""
        return await self._get(f"/v1/rank/top/{season_id}/{team_mode}")

    async def aclose(self):
        await self._client.aclose()


# Singleton
_er_client: ErApiClient | None = None


def get_er_client() -> ErApiClient:
    global _er_client
    if _er_client is None:
        _er_client = ErApiClient()
    return _er_client
