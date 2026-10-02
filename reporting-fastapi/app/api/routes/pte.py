from fastapi import APIRouter, Depends, Query

from app.core.security import get_current_user
from app.metrics.query_engine import run_metric_query

router = APIRouter(prefix="/pte", tags=["pte"], dependencies=[Depends(get_current_user)])


@router.get("/leave-consumption")
def leave_consumption(
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
    department: str | None = Query(default=None),
    leave_type: str | None = Query(default=None),
):
    return run_metric_query(
        "pte.leave_consumption", ["department", "leave_type", "period"],
        {"date_from": date_from, "date_to": date_to, "department": department, "leave_type": leave_type},
    )


@router.get("/headcount")
def headcount(department: str | None = Query(default=None)):
    return run_metric_query(
        "pte.headcount_active", ["department"],
        {"department": department},
    )


@router.get("/vehicle-utilization")
def vehicle_utilization(
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
    vehicle: str | None = Query(default=None),
):
    return run_metric_query(
        "pte.vehicle_utilization", ["vehicle"],
        {"date_from": date_from, "date_to": date_to, "vehicle": vehicle},
    )


@router.get("/room-occupancy")
def room_occupancy(
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
    room: str | None = Query(default=None),
):
    return run_metric_query(
        "pte.room_occupancy", ["room"],
        {"date_from": date_from, "date_to": date_to, "room": room},
    )


@router.get("/vm-lead-time")
def vm_lead_time(
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
):
    return run_metric_query(
        "pte.vm_lead_time", [],
        {"date_from": date_from, "date_to": date_to},
    )


@router.get("/intervention-throughput")
def intervention_throughput(
    date_from: str | None = Query(default=None),
    date_to: str | None = Query(default=None),
    engineer: str | None = Query(default=None),
):
    return run_metric_query(
        "pte.intervention_throughput", ["engineer", "period"],
        {"date_from": date_from, "date_to": date_to, "engineer": engineer},
    )


@router.get("/leaves/by-type")
def compat_leaves_by_type():
    return run_metric_query("pte.leave_consumption", ["leave_type"], {})


@router.get("/leaves/by-department")
def compat_leaves_by_department():
    return run_metric_query("pte.leave_consumption", ["department"], {})


@router.get("/vehicles/usage")
def compat_vehicle_usage():
    return run_metric_query("pte.vehicle_utilization", ["vehicle"], {})


@router.get("/vehicles/gas-consumption")
def compat_gas_consumption():
    return run_metric_query("pte.vehicle_utilization", ["vehicle"], {})


@router.get("/missions")
def compat_missions():
    return run_metric_query("pte.intervention_throughput", ["engineer", "period"], {})


@router.get("/rooms/utilization")
def compat_room_utilization():
    return run_metric_query("pte.room_occupancy", ["room"], {})


@router.get("/users/headcount")
def compat_headcount():
    return run_metric_query("pte.headcount_active", ["department"], {})


@router.get("/virtualization/requests")
def compat_virtualization_requests():
    return run_metric_query("pte.vm_lead_time", [], {})
