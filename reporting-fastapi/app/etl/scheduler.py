from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.core.config import get_settings
from app.etl.pipeline import run_full_etl

scheduler: BackgroundScheduler | None = None


def start_scheduler() -> BackgroundScheduler:
    global scheduler
    if scheduler and scheduler.running:
        return scheduler
    s = get_settings()
    scheduler = BackgroundScheduler(timezone=s.scheduler_timezone)
    scheduler.add_job(run_full_etl, CronTrigger.from_crontab(s.scheduler_cron),
                       id="etl_full", replace_existing=True, misfire_grace_time=600)
    _load_report_jobs(scheduler)
    scheduler.start()
    return scheduler


def _load_report_jobs(s: BackgroundScheduler) -> None:
    try:
        from app.services.report_runner import refresh_report_jobs
        refresh_report_jobs(s)
    except Exception:
        pass  # report_runner may not exist yet at startup


def stop_scheduler() -> None:
    global scheduler
    if scheduler and scheduler.running:
        scheduler.shutdown(wait=False)
