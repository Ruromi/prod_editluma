from pathlib import Path
from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# shared env one level above the repo root; local .env (listed last) takes precedence
_SHARED_ENV = Path(__file__).parents[4] / ".env.shared"
_LOCAL_ENV = Path(__file__).parents[2] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(_SHARED_ENV, _LOCAL_ENV),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Supabase
    supabase_url: str
    supabase_service_role_key: str  # server-only
    supabase_schema: str = "public"

    # S3-compatible storage
    storage_endpoint_url: str = ""
    storage_bucket: str = "editluma-uploads"
    storage_access_key: str = ""
    storage_secret_key: str = ""
    storage_region: str = "ap-northeast-2"

    # Redis / Celery
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"

    # Ideogram
    ideogram_api_key: str = ""
    ideogram_model: str = "V_2"
    ideogram_base_url: str = "https://api.ideogram.ai"
    ideogram_timeout_ms: int = 120000
    groq_api_key: str = ""

    # App
    environment: str = "dev"
    web_app_url: str = "http://localhost:3001"
    cors_origins: list[str] = ["http://localhost:3001", "http://127.0.0.1:3001"]
    presign_upload_expiry_seconds: int = 300
    presign_download_expiry_seconds: int = 3600
    max_upload_file_size_bytes: int = 15 * 1024 * 1024
    initial_user_credits: int = 100
    image_request_credit_cost: int = 10

    # Polar billing
    polar_server: Literal["sandbox", "production"] = "sandbox"
    polar_access_token: str = ""
    polar_webhook_secret: str = ""
    polar_product_id_starter: str = ""
    polar_product_id_pro: str = ""
    polar_product_id_max: str = ""
    polar_checkout_link_starter: str = ""
    polar_checkout_link_pro: str = ""
    polar_checkout_link_max: str = ""

    @property
    def is_production(self) -> bool:
        return self.environment.lower() in {"production", "prod"}

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        self.supabase_schema = (self.supabase_schema or "public").strip().lower() or "public"
        if self.is_production and self.polar_server != "production":
            raise ValueError("POLAR_SERVER must be 'production' when ENVIRONMENT=production")
        if self.is_production and self.supabase_schema != "public":
            raise ValueError("SUPABASE_SCHEMA must be 'public' when ENVIRONMENT=production")
        return self


settings = Settings()
