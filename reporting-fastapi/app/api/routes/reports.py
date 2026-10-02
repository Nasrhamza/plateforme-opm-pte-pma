from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.core.security import get_current_user
from app.db.connections import connections
from app.services.report_runner import run_report
from app.services.report_export import export_report
from app.models.report_config import ReportConfig

router = APIRouter(prefix="/reports", tags=["reports"])


def _coll():
    connections.require_initialized()
    return connections.warehouse_db.report_configs


def _runs():
    connections.require_initialized()
    return connections.warehouse_db.report_runs


@router.post("")
def create_report(cfg: ReportConfig, user: dict = Depends(get_current_user)):
    doc = cfg.model_dump(exclude={"id", "createdAt"})
    doc["owner"] = user["sub"]
    doc["createdAt"] = datetime.now(timezone.utc)
    res = _coll().insert_one(doc)
    return {"id": str(res.inserted_id), **{k: v for k, v in doc.items() if k != "_id"}}


@router.get("")
def list_reports(user: dict = Depends(get_current_user)):
    rows = list(_coll().find({"owner": user["sub"]}))
    for r in rows:
        r["id"] = str(r.pop("_id"))
    return rows


@router.get("/{rid}")
def get_report(rid: str, user: dict = Depends(get_current_user)):
    r = _coll().find_one({"_id": ObjectId(rid), "owner": user["sub"]})
    if not r:
        raise HTTPException(404, "Not found")
    r["id"] = str(r.pop("_id"))
    return r


@router.put("/{rid}")
def update_report(rid: str, payload: dict, user: dict = Depends(get_current_user)):
    res = _coll().update_one(
        {"_id": ObjectId(rid), "owner": user["sub"]},
        {"$set": payload},
    )
    if not res.matched_count:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@router.delete("/{rid}")
def delete_report(rid: str, user: dict = Depends(get_current_user)):
    res = _coll().delete_one({"_id": ObjectId(rid), "owner": user["sub"]})
    if not res.deleted_count:
        raise HTTPException(404, "Not found")
    return {"ok": True}


@router.post("/{rid}/run")
def run(rid: str, user: dict = Depends(get_current_user)):
    return run_report(rid)


@router.get("/{rid}/export")
def export_(rid: str, format: str = "pdf", user: dict = Depends(get_current_user)):
    bundle = run_report(rid)
    started = datetime.now(timezone.utc)
    try:
        path = export_report(rid, format, bundle)
        _runs().insert_one({"report_id": rid, "started_at": started,
                            "finished_at": datetime.now(timezone.utc),
                            "status": "success", "format": format, "file_path": path})
    except Exception as e:
        _runs().insert_one({"report_id": rid, "started_at": started,
                            "finished_at": datetime.now(timezone.utc),
                            "status": "failed", "format": format, "error": str(e)})
        raise
    return FileResponse(path, filename=f"{rid}.{format}")


@router.get("/{rid}/history")
def history(rid: str, user: dict = Depends(get_current_user)):
    rows = list(_runs().find({"report_id": rid}).sort("started_at", -1).limit(50))
    for r in rows:
        r["id"] = str(r.pop("_id"))
    return rows


@router.post("/_scheduler/refresh")
def refresh(user: dict = Depends(get_current_user)):
    from app.etl.scheduler import scheduler
    from app.services.report_runner import refresh_report_jobs
    if scheduler:
        refresh_report_jobs(scheduler)
    return {"ok": True}
