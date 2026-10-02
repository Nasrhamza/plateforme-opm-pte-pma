from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class MetricQueryRequest(BaseModel):
    metric_id: str = Field(..., alias="metricId")
    dimensions: list[str] = Field(default_factory=list)
    filters: dict[str, Any] = Field(default_factory=dict)
    grain: str = "month"
    limit: int = 100


class MetricResponse(BaseModel):
    metric: str
    dimensions: list[str]
    filters: dict[str, Any]
    period: str
    data: list[dict[str, Any]]
    generatedAt: datetime
    freshness: dict[str, Any]
