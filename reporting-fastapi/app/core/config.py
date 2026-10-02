from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Reporting FastAPI"
    app_env: str = "development"
    port: int = 8000
    log_level: str = "INFO"

    opm_api_base_url: str = "http://localhost:3000"
    pte_api_base_url: str = "http://localhost:3001/api"
    pma_api_base_url: str = "http://localhost:3002/api/v1"
    api_timeout_seconds: int = 30

    opm_api_token: str | None = None
    pte_api_token: str | None = None
    pma_api_token: str | None = None

    opm_api_email: str | None = None
    opm_api_password: str | None = None
    pte_api_email: str | None = None
    pte_api_password: str | None = None
    pma_api_email: str | None = None
    pma_api_password: str | None = None

    reporting_warehouse_uri: str = "mongodb://localhost:27017/reporting_etl"

    scheduler_enabled: bool = True
    scheduler_cron: str = "*/30 * * * *"

    pg_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/reporting"

    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expires_in: int = 86400  # 24h

    cors_origins: str = (
        "http://localhost:4200,http://localhost:4201,"
        "http://localhost:4202,http://localhost:4203"
    )

    mail_host: str = "localhost"
    mail_port: int = 1025
    mail_user: str | None = None
    mail_password: str | None = None
    mail_from: str = "reports@reporting.local"
    mail_tls: bool = False
    mail_ssl: bool = False

    reports_storage_path: str = "var/reports"

    scheduler_timezone: str = "UTC"

    model_config = SettingsConfigDict(
        env_file=(".env", "app/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @model_validator(mode="after")
    def reject_insecure_production_secret(self):
        if self.app_env.lower() == "production" and self.jwt_secret == "change-me-in-production":
            raise ValueError("JWT_SECRET must be configured in production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
