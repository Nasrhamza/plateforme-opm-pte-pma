from datetime import datetime, timezone
from typing import Literal
from pydantic import BaseModel

from app.db.connections import connections


class ReportRun(BaseModel):
    id: str | None = None
    report_id: str
    started_at: datetime
    finished_at: datetime | None = None
    status: Literal["running", "success", "failed"]
    format: str
    file_path: str | None = None
    recipients: list[str] = []
    error: str | None = None


def _coll():
    connections.require_initialized()
    return connections.warehouse_db.report_runs
