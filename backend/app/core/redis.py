import json
import logging
from urllib.parse import urlsplit
from typing import Any, Optional
import redis.asyncio as aioredis
from .config import settings

_redis: Optional[aioredis.Redis] = None
# Uvicorn 콘솔에 확실히 출력되도록 uvicorn.error 로거 사용
logger = logging.getLogger("uvicorn.error")


def _mask_redis_url(url: str) -> str:
    try:
        p = urlsplit(url)
        host = p.hostname or "unknown-host"
        port = p.port or 6379
        return f"{p.scheme}://{host}:{port}"
    except Exception:
        return "<invalid-redis-url>"


def _normalize_redis_url(url: str) -> str:
    # Upstash는 TLS(rediss://)를 요구한다.
    try:
        p = urlsplit(url)
        if p.scheme == "redis" and (p.hostname or "").endswith("upstash.io"):
            secure = "rediss://" + url.split("://", 1)[1]
            logger.warning(
                "[redis] upstash with redis:// detected. auto-upgrading to rediss://"
            )
            return secure
    except Exception:
        pass
    return url


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        redis_url = _normalize_redis_url(settings.redis_url)
        logger.info("[redis] connecting: %s", _mask_redis_url(redis_url))
        _redis = aioredis.from_url(redis_url, decode_responses=True)
        logger.info("[redis] client initialized")
    return _redis


async def cache_get(key: str) -> Optional[Any]:
    r = await get_redis()
    try:
        value = await r.get(key)
    except Exception:
        logger.exception("[redis] cache get failed key=%s", key)
        raise
    if value:
        logger.info("[redis] cache hit key=%s", key)
        try:
            return json.loads(value)
        except Exception:
            logger.exception("[redis] cache decode failed key=%s", key)
            raise
    logger.info("[redis] cache miss key=%s", key)
    return None


async def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    r = await get_redis()
    try:
        await r.set(key, json.dumps(value, default=str), ex=ttl)
    except Exception:
        logger.exception("[redis] cache set failed key=%s ttl=%s", key, ttl)
        raise
    logger.info("[redis] cache set key=%s ttl=%s", key, ttl)


async def cache_delete(key: str) -> None:
    r = await get_redis()
    try:
        deleted = await r.delete(key)
    except Exception:
        logger.exception("[redis] cache delete failed key=%s", key)
        raise
    logger.info("[redis] cache delete key=%s deleted=%s", key, int(deleted))


async def cache_delete_pattern(pattern: str) -> None:
    r = await get_redis()
    try:
        keys = await r.keys(pattern)
    except Exception:
        logger.exception("[redis] cache keys failed pattern=%s", pattern)
        raise
    if keys:
        try:
            deleted = await r.delete(*keys)
        except Exception:
            logger.exception("[redis] cache delete failed pattern=%s", pattern)
            raise
        logger.info(
            "[redis] cache delete pattern=%s matched=%s deleted=%s",
            pattern,
            len(keys),
            int(deleted),
        )
    else:
        logger.info("[redis] cache delete pattern=%s matched=0", pattern)
