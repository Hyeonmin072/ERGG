"""
Supabase 클라이언트 (백엔드용).

우선순위:
1) SUPABASE_SERVICE_ROLE_KEY (JWT, eyJ… — 서버 쓰기 권장)
2) SUPABASE_ANON_KEY (JWT, eyJ… — RLS 정책에 따라 쓰기 제한)
3) sb_publishable_… 등 (supabase-js용 신규 키 — supabase-py와 호환 안 될 수 있음)

URL: SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_URL
"""
from __future__ import annotations

from supabase import Client, create_client
from ..core.config import settings


_supabase_client: Client | None = None


def _resolve_supabase_url() -> str:
    return settings.supabase_url or settings.next_public_supabase_url


def _is_jwt_style_key(key: str) -> bool:
    k = key.strip()
    return k.startswith("eyJ") and "." in k


def _resolve_supabase_key() -> str:
    return (
        settings.supabase_service_role_key
        or settings.supabase_anon_key
        or settings.supabase_publishable_key
        or settings.next_public_supabase_publishable_default_key
    )


def _validate_key_for_py_client(key: str) -> None:
    """supabase-py create_client는 일반적으로 JWT(anon/service_role)를 기대한다."""
    if not key:
        return
    if _is_jwt_style_key(key):
        return
    if key.startswith("sb_publishable_") or key.startswith("sb_secret_"):
        raise RuntimeError(
            "Supabase 키가 supabase-py와 호환되지 않습니다. "
            "대시보드 Project Settings → API에서 "
            "'service_role' 또는 'anon' 키(JWT, eyJ로 시작하는 긴 문자열)를 복사해 "
            "SUPABASE_SERVICE_ROLE_KEY(쓰기 권장) 또는 SUPABASE_ANON_KEY에 넣으세요. "
            "sb_publishable_ 키는 JS 클라이언트용이며 Python 클라이언트에서 Invalid API key가 날 수 있습니다."
        )


def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    url = _resolve_supabase_url()
    key = _resolve_supabase_key()

    if not url:
        raise RuntimeError(
            "Supabase URL이 없습니다. SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_URL을 설정하세요."
        )
    if not key:
        raise RuntimeError(
            "Supabase Key가 없습니다. SUPABASE_SERVICE_ROLE_KEY(JWT) 설정을 권장합니다."
        )

    _validate_key_for_py_client(key)

    _supabase_client = create_client(url, key)
    return _supabase_client
