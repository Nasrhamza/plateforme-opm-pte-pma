from datetime import datetime, timezone
from bson import ObjectId

from app.db.connections import connections
from app.metrics.query_engine import run_metric_query


def run_report(report_id: str) -> dict:
    db = connections.warehouse_db
    cfg = db.report_configs.find_one({"_id": ObjectId(report_id)})
    if not cfg:
        raise ValueError(f"Report {report_id} not found")
    filters = cfg.get("filters") or {}
    bundles = []
    for kpi in cfg["kpis"]:
        try:
            result = run_metric_query(kpi, [], filters, limit=500, include_comparison=False)
        except Exception as e:
            result = {"error": str(e), "data": []}
        bundles.append({
            "kpi": kpi,
            "result": result,
        })
    return {
        "report_id": report_id,
        "name": cfg["name"],
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "filters": filters,
        "kpis": bundles,
    }


def refresh_report_jobs(scheduler) -> None:
    """Sync APScheduler jobs to the current enabled report_configs."""
    from apscheduler.triggers.cron import CronTrigger
    db = connections.warehouse_db
    # remove existing report jobs
    for j in list(scheduler.get_jobs()):
        if j.id.startswith("report:"):
            scheduler.remove_job(j.id)
    cron = {"daily": "0 8 * * *", "weekly": "0 8 * * 1", "monthly": "0 8 1 * *"}
    for cfg in db.report_configs.find({"schedule.enabled": True}):
        rid = str(cfg["_id"])
        freq = cfg.get("schedule", {}).get("frequency", "weekly")
        scheduler.add_job(
            _scheduled_run, CronTrigger.from_crontab(cron[freq]),
            args=[rid], id=f"report:{rid}", replace_existing=True,
        )


def _scheduled_run(report_id: str) -> None:
    from app.services.report_export import export_report
    from app.services.mailer import send_report_email
    db = connections.warehouse_db
    cfg = db.report_configs.find_one({"_id": ObjectId(report_id)})
    fmt = cfg.get("format", "pdf")
    bundle = run_report(report_id)
    path = export_report(report_id, fmt, bundle)
    recipients = cfg.get("schedule", {}).get("recipients") or []
    if recipients:
        send_report_email(recipients, cfg["name"], path)
    db.report_configs.update_one(
        {"_id": ObjectId(report_id)},
        {"$set": {"schedule.lastSentAt": datetime.now(timezone.utc)}},
    )
