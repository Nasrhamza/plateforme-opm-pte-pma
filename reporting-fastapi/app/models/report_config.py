from datetime import datetime, timezone
from typing import Any, Literal
from pydantic import BaseModel, Field

from app.db.connections import connections


class Schedule(BaseModel):
    enabled: bool = False
    frequency: Literal["daily", "weekly", "monthly"] = "weekly"
    format: Literal["pdf", "xlsx", "json"] = "pdf"
    recipients: list[str] = []
    lastSentAt: datetime | None = None

    model_config = {"extra": "ignore"}


class ReportConfig(BaseModel):
    id: str | None = None
    name: str
    description: str | None = None
    owner: str | None = None   # set server-side from JWT; ignored if provided by client
    kpis: list[Any] = []      # accepts list[str] or list[{source, metric, label}]
    filters: dict = {}
    schedule: Schedule = Field(default_factory=Schedule)
    format: Literal["pdf", "xlsx", "json"] = "pdf"
    isActive: bool = True
    createdAt: datetime | None = None

    model_config = {"extra": "ignore"}


def _coll():
    connections.require_initialized()
    return connections.warehouse_db.report_configs
