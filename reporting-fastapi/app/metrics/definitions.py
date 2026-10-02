KPI_DEFINITIONS = {
    "exec.company_throughput": {
        "schema": "mart_exec",
        "view": "v_company_throughput",
        "group_by": ["period"],
    },
    "exec.pm_scorecard": {
        "schema": "mart_exec",
        "view": "v_pm_scorecard",
        "group_by": ["team_leader", "period"],
    },
    "exec.revenue_at_risk": {
        "schema": "mart_exec",
        "view": "v_revenue_at_risk",
        "group_by": [],
    },
    "exec.client_health": {
        "schema": "mart_exec",
        "view": "v_client_health",
        "group_by": ["client", "period"],
    },
    "exec.workforce_availability": {
        "schema": "mart_exec",
        "view": "v_workforce_availability",
        "group_by": ["department", "period"],
    },
    "opm.tickets_by_status": {
        "schema": "mart_opm",
        "view": "v_tickets_by_status",
        "group_by": ["period", "status"],
    },
    "opm.sla_compliance": {
        "schema": "mart_opm",
        "view": "v_sla_compliance",
        "group_by": ["contract", "period"],
    },
    "opm.mttr": {
        "schema": "mart_opm",
        "view": "v_mttr",
        "group_by": ["contract", "period"],
    },
    "opm.mtta": {
        "schema": "mart_opm",
        "view": "v_mtta",
        "group_by": ["contract", "period"],
    },
    "opm.first_call_resolution": {
        "schema": "mart_opm",
        "view": "v_first_call_resolution",
        "group_by": ["period"],
    },
    "opm.technician_load": {
        "schema": "mart_opm",
        "view": "v_technician_load",
        "group_by": ["technician", "period"],
    },
    "opm.contract_health": {
        "schema": "mart_opm",
        "view": "v_contract_health",
        "group_by": ["contract", "period"],
    },
    "pma.tasks_by_status": {
        "schema": "mart_pma",
        "view": "v_tasks_by_status",
        "group_by": ["status", "period"],
    },
    "pma.tasks_by_priority": {
        "schema": "mart_pma",
        "view": "v_tasks_by_priority",
        "group_by": ["priority", "period"],
    },
    "pma.portfolio_status": {
        "schema": "mart_pma",
        "view": "v_portfolio_status",
        "group_by": ["period", "status"],
    },
    "pma.on_time_delivery": {
        "schema": "mart_pma",
        "view": "v_on_time_delivery",
        "group_by": ["period"],
    },
    "pma.team_leader_score": {
        "schema": "mart_pma",
        "view": "v_team_leader_score",
        "group_by": ["team_leader", "period"],
    },
    "pma.engineer_productivity": {
        "schema": "mart_pma",
        "view": "v_engineer_productivity",
        "group_by": ["engineer", "period"],
    },
    "pma.overdue_index": {
        "schema": "mart_pma",
        "view": "v_overdue_index",
        "group_by": ["project", "period"],
    },
    "pte.leave_consumption": {
        "schema": "mart_pte",
        "view": "v_leave_consumption",
        "group_by": ["department", "leave_type", "period"],
    },
    "pte.headcount_active": {
        "schema": "mart_pte",
        "view": "v_headcount_active",
        "group_by": ["department"],
    },
    "pte.vehicle_utilization": {
        "schema": "mart_pte",
        "view": "v_vehicle_utilization",
        "group_by": ["vehicle", "period"],
    },
    "pte.room_occupancy": {
        "schema": "mart_pte",
        "view": "v_room_occupancy",
        "group_by": ["room"],
    },
    "pte.vm_lead_time": {
        "schema": "mart_pte",
        "view": "v_vm_lead_time",
        "group_by": [],
    },
    "pte.intervention_throughput": {
        "schema": "mart_pte",
        "view": "v_intervention_throughput",
        "group_by": ["engineer", "period"],
    },
}
