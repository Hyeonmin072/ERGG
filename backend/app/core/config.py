import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def _resolve_backend_root() -> Path:
    # PyInstaller 등으로 묶을 때 __file__ 기준이 달라질 수 있어 런처가 설정
    override = os.environ.get("ERG_BACKEND_ROOT", "").strip()
    if override:
        return Path(override).resolve()
    # 기본: backend/app/core/config.py → backend 루트
    return Path(__file__).resolve().parent.parent.parent


_BACKEND_ROOT = _resolve_backend_root()
# 둘 다 있으면 뒤쪽(backend/.env)이 우선(덮어씀)
_ENV_CANDIDATES = (
    _BACKEND_ROOT.parent / ".env",
    _BACKEND_ROOT / ".env",
)
_ENV_FILES = tuple(str(p) for p in _ENV_CANDIDATES if p.is_file())


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_ENV_FILES if _ENV_FILES else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ER API
    er_api_key: str = ""
    er_api_base_url: str = "https://open-api.bser.io"

    # Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    # Database
    database_url: str = "postgresql+asyncpg://ergg_user:ergg_password@localhost:5432/ergg_db"

    # Supabase (supabase-py는 대시보드의 JWT 키 anon / service_role 사용)
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_anon_key: str = ""
    supabase_publishable_key: str = ""
    next_public_supabase_url: str = ""
    next_public_supabase_publishable_default_key: str = ""

    # Redis
    redis_url: str = "redis://localhost:6379"

    # JWT
    jwt_secret: str = "change_this_in_production_min_32_chars"
    jwt_expire_hours: int = 24

    # App
    app_env: str = "development"
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


settings = Settings()
