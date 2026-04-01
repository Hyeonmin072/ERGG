"""정적 마스터 데이터 (character 테이블 등)."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..clients.supabase_client import get_supabase_client
from ..core.redis import cache_get, cache_set

router = APIRouter()


def _pick(r: dict, *keys: str):
    for k in keys:
        if k in r and r[k] is not None:
            return r[k]
    return None


@router.get("/characters")
async def list_characters():
    """
    Supabase `character` 테이블 — characterNum 기준 이름·무기 타입 등.
    DB 컬럼은 snake_case(레거시)일 수 있음 → 응답은 프론트용 camelCase로 통일.
    """
    cache_key = "catalog:characters:v1"
    try:
        cached = await cache_get(cache_key)
        if cached:
            return cached
    except Exception:
        pass

    try:
        sb = get_supabase_client()
        resp = (
            sb.table("character")
            .select("character_num,name,name_ko,name_en,weapon_type,weapon_code")
            .order("character_num")
            .execute()
        )
        rows = resp.data or []
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"character 테이블 조회 실패: {e}")

    items: list[dict] = []
    for r in rows:
        try:
            cn = _pick(r, "characterNum", "character_num")
            if cn is None:
                continue
            items.append(
                {
                    "characterNum": int(cn),
                    "name": (r.get("name") or "") or "",
                    "nameKo": _pick(r, "nameKo", "name_ko"),
                    "nameEn": _pick(r, "nameEn", "name_en"),
                    "weaponType": _pick(r, "weaponType", "weapon_type"),
                    "weaponCode": _pick(r, "weaponCode", "weapon_code"),
                }
            )
        except (TypeError, ValueError):
            continue

    out = {"items": items}
    try:
        await cache_set(cache_key, out, ttl=3600)
    except Exception:
        pass
    return out
