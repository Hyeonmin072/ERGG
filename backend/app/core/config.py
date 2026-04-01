from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=("backend/.env", ".env"),
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
