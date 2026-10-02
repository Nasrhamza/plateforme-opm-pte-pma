from fastapi import APIRouter, Depends, Query

from app.core.security import get_current_user
from app.metrics.query_engine import run_metric_query

router = APIRouter(prefix="/exec", tags=["exec"], dependencies=[Depends(get_current_user)])


@router.get("/company-throughput")
def company_throughput(
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
):
    return run_metric_query(
        "exec.company_throughput", ["period"],
        {"date_from": date_from, "date_to": date_to},
    )


@router.get("/pm-scorecard")
def pm_scorecard(
    team_leader: str | None = Query(default=None),
):
    return run_metric_query(
        "exec.pm_scorecard", ["team_leader"],
        {"team_leader": team_leader},
    )


@router.get("/revenue-at-risk")
def revenue_at_risk(
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
):
    return run_metric_query(
        "exec.revenue_at_risk", [],
        {"date_from": date_from, "date_to": date_to},
    )


@router.get("/client-health")
def client_health(
    client: str | None = Query(default=None),
):
    return run_metric_query(
        "exec.client_health", ["client"],
        {"client": client},
    )


@router.get("/workforce-availability")
def workforce_availability(
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
    department: str | None = Query(default=None),
):
    return run_metric_query(
        "exec.workforce_availability", ["department", "period"],
        {"date_from": date_from, "date_to": date_to, "department": department},
    )
