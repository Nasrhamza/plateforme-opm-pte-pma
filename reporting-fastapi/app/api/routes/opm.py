from fastapi import APIRouter, Depends, Query

from app.core.security import get_current_user
from app.metrics.query_engine import run_metric_query

router = APIRouter(prefix="/opm", tags=["opm"], dependencies=[Depends(get_current_user)])


@router.get("/tickets-by-status")
def tickets_by_status(
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
):
    return run_metric_query(
        "opm.tickets_by_status", ["status"],
        {"date_from": date_from, "date_to": date_to},
    )


@router.get("/sla-compliance")
def sla_compliance(
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
    contract: str | None = Query(default=None),
):
    return run_metric_query(
        "opm.sla_compliance", ["contract", "period"],
        {"date_from": date_from, "date_to": date_to, "contract": contract},
    )


@router.get("/mttr")
def mttr(
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
    contract: str | None = Query(default=None),
):
    return run_metric_query(
        "opm.mttr", ["contract"],
        {"date_from": date_from, "date_to": date_to, "contract": contract},
    )


@router.get("/mtta")
def mtta(
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
    contract: str | None = Query(default=None),
):
    return run_metric_query(
        "opm.mtta", ["contract"],
        {"date_from": date_from, "date_to": date_to, "contract": contract},
    )


@router.get("/first-call-resolution")
def first_call_resolution(
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
):
    return run_metric_query(
        "opm.first_call_resolution", ["period"],
        {"date_from": date_from, "date_to": date_to},
    )


@router.get("/technician-load")
def technician_load(
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
    technician: str | None = Query(default=None),
):
    return run_metric_query(
        "opm.technician_load", ["technician"],
        {"date_from": date_from, "date_to": date_to, "technician": technician},
    )


@router.get("/contract-health")
def contract_health(
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
    contract: str | None = Query(default=None),
):
    return run_metric_query(
        "opm.contract_health", ["contract"],
        {"date_from": date_from, "date_to": date_to, "contract": contract},
    )


# Backward-compatible routes used by the first reporting UI and external demos.
@router.get("/tickets/by-status")
def compat_tickets_by_status():
    return run_metric_query("opm.tickets_by_status", ["status"], {})


@router.get("/tickets/by-period")
def compat_tickets_by_period():
    return run_metric_query("opm.first_call_resolution", ["period"], {})


@router.get("/tickets/by-technician")
def compat_tickets_by_technician():
    return run_metric_query("opm.technician_load", ["technician"], {})


@router.get("/tickets/resolution-rate")
def compat_resolution_rate():
    return run_metric_query("opm.first_call_resolution", ["period"], {})


@router.get("/tickets/expired")
def compat_expired_tickets():
    return run_metric_query("opm.contract_health", ["contract"], {})


@router.get("/tickets/sla-compliance")
def compat_sla_compliance():
    return run_metric_query("opm.sla_compliance", ["contract", "period"], {})
