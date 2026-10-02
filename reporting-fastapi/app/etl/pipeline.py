import uuid
from datetime import datetime, timezone

from sqlalchemy import text

from app.db.connections import connections
from app.db.pg_apply import apply_sql_dir
from app.db.warehouse_schema import ensure_warehouse_schema
from app.etl.extract import extract_all, save_bronze
from app.etl.transform_silver import run_silver
from app.etl.mdm import run_mdm
from app.etl.load_dims import load_all_dims
from app.etl.load_facts import load_all_facts

_MART_VIEWS = [
    "mart_opm.v_sla_compliance", "mart_opm.v_mttr", "mart_opm.v_mtta",
    "mart_opm.v_first_call_resolution", "mart_opm.v_technician_load",
    "mart_opm.v_contract_health", "mart_opm.v_tickets_by_status",
    "mart_pma.v_portfolio_status", "mart_pma.v_on_time_delivery",
    "mart_pma.v_team_leader_score", "mart_pma.v_engineer_productivity",
    "mart_pma.v_overdue_index", "mart_pma.v_tasks_by_status", "mart_pma.v_tasks_by_priority",
    "mart_pte.v_leave_consumption", "mart_pte.v_headcount_active",
    "mart_pte.v_vehicle_utilization", "mart_pte.v_room_occupancy",
    "mart_pte.v_vm_lead_time", "mart_pte.v_intervention_throughput",
    "mart_exec.v_company_throughput", "mart_exec.v_pm_scorecard",
    "mart_exec.v_revenue_at_risk", "mart_exec.v_client_health",
    "mart_exec.v_workforce_availability",
]


def _refresh_marts() -> None:
    with connections.pg_engine.begin() as conn:
        for view in _MART_VIEWS:
            conn.execute(text(f"REFRESH MATERIALIZED VIEW {view}"))


def run_full_etl(skip_extract: bool = False) -> dict:
    connections.initialize()
    ensure_warehouse_schema(connections.warehouse_db)
    apply_sql_dir("app/db/ddl")
    apply_sql_dir("seeds")

    etl_run_id = uuid.uuid4().hex
    started = datetime.now(timezone.utc)
    counts: dict = {"etl_run_id": etl_run_id, "started_at": started.isoformat()}

    if not skip_extract:
        extracted = extract_all()
        counts["bronze"] = save_bronze(extracted, etl_run_id)
    counts["silver"] = run_silver(etl_run_id if not skip_extract else None)
    counts["mdm"] = run_mdm()
    counts["dims"] = load_all_dims()
    counts["facts"] = load_all_facts()
    _refresh_marts()
    counts["finished_at"] = datetime.now(timezone.utc).isoformat()

    connections.warehouse_db.etl_runs.insert_one({
        "run_id": etl_run_id,
        "started_at": started,
        "finished_at": datetime.now(timezone.utc),
        "status": "ok",
        "counts": counts,
    })
    return counts


def run_backfill_etl() -> dict:
    """Replay silver→gold from existing bronze without hitting REST."""
    return run_full_etl(skip_extract=True)
