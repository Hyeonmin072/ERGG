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
            for attempt in range(3):
                try:
                    resp = await self._client.get(path, params=params)
                    resp.raise_for_status()
                    return resp.json()
                except httpx.HTTPStatusError as e:
                    # 429 is transient; retry with backoff, then bubble up.
                    if e.response is not None and e.response.status_code == 429 and attempt < 2:
                        await asyncio.sleep(1.5 * (attempt + 1))
                        continue
                    raise
                finally:
                    await asyncio.sleep(1.0)  # Base pacing between requests
            raise RuntimeError("ER API request retry exceeded unexpectedly")

    async def search_by_nickname(self, nickname: str) -> dict:
        """
        닉네임으로 유저 조회.

        BSER API는 앞뒤 공백이 포함된 query에서 404를 반환하므로 반드시 strip 한다.
        """
        nick = (nickname or "").strip()
        return await self._get("/v1/user/nickname", params={"query": nick})

    async def get_user_by_user_id(self, user_id: str) -> dict:
        """userId로 유저 조회 (지원되는 경우)."""
        return await self._get(f"/v1/user/userid/{user_id}")

    async def get_user_games_by_user_id(self, user_id: str, next_cursor: str | None = None) -> dict:
        """
        GET /v1/user/games/uid/{userId}
        페이지당 최대 약 10건, 다음 페이지는 응답의 `next`를 쿼리 `?next=` 로 전달.
        """
        params = {}
        if next_cursor:
            params["next"] = next_cursor
        return await self._get(f"/v1/user/games/uid/{user_id}", params=params)

    async def get_user_games_by_user_id_merged(
        self,
        user_id: str,
        *,
        start_cursor: str | None = None,
        max_pages: int = 2,
    ) -> dict:
        """
        동일 userId로 연속 페이지를 호출해 userGames를 합친다.
        (1페이지 ~10건 + next로 2페이지 ~10건 → 최대 ~20건)
        """
        uid = user_id.strip()
        merged: list[dict] = []
        cur: str | None = start_cursor
        last: dict = {}
        for _ in range(max(1, min(max_pages, 10))):
            last = await self.get_user_games_by_user_id(uid, next_cursor=cur)
            if last.get("code") != 200:
                return {
                    "code": last.get("code"),
                    "userGames": merged,
                    "next": last.get("next"),
                }
            merged.extend(last.get("userGames") or [])
            nxt = last.get("next")
            if not nxt:
                return {"code": 200, "userGames": merged, "next": None}
            cur = nxt
        return {"code": 200, "userGames": merged, "next": last.get("next")}

    async def get_game_detail(self, game_id: int) -> dict:
        """특정 게임 상세 조회."""
        return await self._get(f"/v1/games/{game_id}")

    async def get_top_rank(self, season_id: int, team_mode: int) -> dict:
        """상위 랭킹 조회."""
        return await self._get(f"/v1/rank/top/{season_id}/{team_mode}")

    async def get_user_stats_by_user_id(self, user_id: str, season_id: int, matching_mode: int) -> dict:
        """
        GET /v2/user/stats/uid/{userId}/{seasonId}/{matchingMode}
        응답에 포함된 rank(래더 등수) 조회용.
        """
        return await self._get(f"/v2/user/stats/uid/{user_id}/{season_id}/{matching_mode}")

    async def aclose(self):
        await self._client.aclose()


# Singleton
_er_client: ErApiClient | None = None


def get_er_client() -> ErApiClient:
    global _er_client
    if _er_client is None:
        _er_client = ErApiClient()
    return _er_client
