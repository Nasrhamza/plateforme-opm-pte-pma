from fastapi import APIRouter
from bson import ObjectId

from app.db.connections import connections
from app.etl.pipeline import run_backfill_etl, run_full_etl
import app.etl.scheduler as _sched_module

router = APIRouter(prefix="/etl", tags=["etl"])


@router.post("/run")
def run_etl():
    connections.require_initialized()
    return run_full_etl()


@router.post("/backfill")
def backfill_etl():
    connections.require_initialized()
    return run_backfill_etl()


@router.get("/status")
def etl_status():
    connections.require_initialized()

    def _json_safe(value):
        if isinstance(value, ObjectId):
            return str(value)
        if isinstance(value, dict):
            return {k: _json_safe(v) for k, v in value.items()}
        if isinstance(value, list):
            return [_json_safe(v) for v in value]
        return value

    latest = connections.warehouse_db.etl_runs.find_one(sort=[("started_at", -1)])
    s = _sched_module.scheduler
    return {
        "schedulerRunning": bool(s and s.running),
        "latestRun": _json_safe(latest) if latest else None,
    }
