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


def _fetch_character_rows():
    """
    character 테이블 컬럼명이 환경마다 camelCase/snake_case로 달라질 수 있어
    camelCase 우선 조회 후 실패 시 snake_case로 재시도한다.
    """
    sb = get_supabase_client()

    try:
        resp = sb.table("character").select("*").order("characterNum").execute()
        return resp.data or []
    except Exception as first_err:
        try:
            resp = sb.table("character").select("*").order("character_num").execute()
            return resp.data or []
        except Exception as second_err:
            raise RuntimeError(
                f"characterNum 정렬 실패: {first_err} | character_num 정렬 실패: {second_err}"
            ) from second_err


@router.get("/weapons")
async def list_weapons():
    """
    Supabase `weapon` 테이블 — id는 best_weapon(WeaponTypeInfo 1-based) 코드와 동일.
    UI 아이콘·툴팁용 한글/영문 이름.
    """
    cache_key = "catalog:weapons:v1"
    try:
        cached = await cache_get(cache_key)
        if cached:
            return cached
    except Exception:
        pass

    sb = get_supabase_client()
    try:
        resp = sb.table("weapon").select("id,name,nameEn").order("id").execute()
        rows = resp.data or []
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"weapon 테이블 조회 실패: {e}") from e

    items: list[dict] = []
    for r in rows:
        try:
            wid = _pick(r, "id")
            if wid is None:
                continue
            items.append(
                {
                    "code": int(wid),
                    "name": (r.get("name") or "") or "",
                    "nameEn": _pick(r, "nameEn", "name_en"),
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


@router.get("/characters")
async def list_characters():
    """
    Supabase `character` 테이블 — characterNum 기준 이름·무기 타입 등.
    DB 컬럼은 camelCase(schema.sql) → 응답도 camelCase.
    """
    cache_key = "catalog:characters:v2"
    try:
        cached = await cache_get(cache_key)
        if cached:
            return cached
    except Exception:
        pass

    try:
        rows = _fetch_character_rows()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"character 테이블 조회 실패: {e}")

    items: list[dict] = []
    for r in rows:
        try:
            cn = _pick(r, "characterNum")
            if cn is None:
                continue
            mwc = _pick(r, "masteryWeaponCodes")
            items.append(
                {
                    "characterNum": int(cn),
                    "name": (r.get("name") or "") or "",
                    "nameKo": _pick(r, "nameKo", "name_ko"),
                    "nameEn": _pick(r, "nameEn", "name_en"),
                    "weaponType": _pick(r, "weaponType", "weapon_type"),
                    "weaponCode": _pick(r, "weaponCode", "weapon_code"),
                    "masteryWeaponCodes": (
                        list(mwc)
                        if isinstance(mwc, list)
                        else list(_pick(r, "mastery_weapon_codes") or [])
                    ),
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
