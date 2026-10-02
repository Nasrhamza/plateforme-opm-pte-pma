from fastapi import APIRouter, Depends, Query

from app.core.security import get_current_user
from app.metrics.query_engine import run_metric_query

router = APIRouter(prefix="/pma", tags=["pma"], dependencies=[Depends(get_current_user)])


@router.get("/tasks-by-status")
def tasks_by_status():
    return run_metric_query("pma.tasks_by_status", ["status"], {})


@router.get("/tasks-by-priority")
def tasks_by_priority():
    return run_metric_query("pma.tasks_by_priority", ["priority"], {})


@router.get("/portfolio-status")
def portfolio_status(status: str | None = Query(default=None)):
    return run_metric_query("pma.portfolio_status", ["status"], {"status": status})


@router.get("/on-time-delivery")
def on_time_delivery(
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
):
    return run_metric_query(
        "pma.on_time_delivery", ["period"],
        {"date_from": date_from, "date_to": date_to},
    )


@router.get("/team-leader-score")
def team_leader_score(team_leader: str | None = Query(default=None)):
    return run_metric_query(
        "pma.team_leader_score", ["team_leader"],
        {"team_leader": team_leader},
    )


@router.get("/engineer-productivity")
def engineer_productivity(engineer: str | None = Query(default=None)):
    return run_metric_query(
        "pma.engineer_productivity", ["engineer"],
        {"engineer": engineer},
    )


@router.get("/overdue-index")
def overdue_index(project: str | None = Query(default=None)):
    return run_metric_query(
        "pma.overdue_index", ["project"],
        {"project": project},
    )


@router.get("/projects/by-status")
def compat_projects_by_status():
    return run_metric_query("pma.portfolio_status", ["status"], {})


@router.get("/projects/overdue")
def compat_projects_overdue():
    return run_metric_query("pma.overdue_index", ["project"], {})


@router.get("/tasks/by-status")
def compat_tasks_by_status():
    return run_metric_query("pma.tasks_by_status", ["status"], {})


@router.get("/tasks/by-priority")
def compat_tasks_by_priority():
    return run_metric_query("pma.tasks_by_priority", ["priority"], {})


@router.get("/tasks/workload")
def compat_workload():
    return run_metric_query("pma.engineer_productivity", ["engineer"], {})


@router.get("/reclamations")
def compat_reclamations():
    return run_metric_query("pma.team_leader_score", ["team_leader"], {})


@router.get("/ratings")
def compat_ratings():
    return run_metric_query("pma.team_leader_score", ["team_leader"], {})
