from datetime import datetime
from sqlalchemy import text

from app.db.connections import connections


def _date_sk(dt: datetime | None) -> int | None:
    if not dt:
        return None
    return dt.year * 10000 + dt.month * 100 + dt.day


def _hour_sk(dt: datetime | None) -> int | None:
    return dt.hour if dt else None


def _upsert_status(conn, **flags) -> int | None:
    """Insert a status combo if missing; return its status_sk."""
    res = conn.execute(text("""
        INSERT INTO core.dim_status
          (ticket_status, task_status, event_status, is_overdue, is_expired,
           is_helpdesk, is_sla_breach, is_accepted)
        VALUES (:ticket_status, :task_status, :event_status, :is_overdue, :is_expired,
                :is_helpdesk, :is_sla_breach, :is_accepted)
        ON CONFLICT DO NOTHING
        RETURNING status_sk
    """), flags).first()
    if res:
        return res[0]
    row = conn.execute(text("""
        SELECT status_sk FROM core.dim_status WHERE
          COALESCE(ticket_status,'') = COALESCE(:ticket_status,'') AND
          COALESCE(task_status,'')   = COALESCE(:task_status,'') AND
          COALESCE(event_status,'')  = COALESCE(:event_status,'') AND
          COALESCE(is_overdue,FALSE) = COALESCE(:is_overdue,FALSE) AND
          COALESCE(is_expired,FALSE) = COALESCE(:is_expired,FALSE) AND
          COALESCE(is_helpdesk,FALSE)= COALESCE(:is_helpdesk,FALSE) AND
          COALESCE(is_sla_breach,FALSE)=COALESCE(:is_sla_breach,FALSE) AND
          COALESCE(is_accepted,FALSE)= COALESCE(:is_accepted,FALSE)
    """), flags).first()
    return row[0] if row else None


def _contract_sla_map(conn) -> dict[str, int]:
    rows = conn.execute(text("SELECT source_id, sla_hours FROM core.dim_contract WHERE sla_hours > 0")).fetchall()
    return {r[0]: r[1] for r in rows}


def load_fact_opm_ticket() -> int:
    connections.require_initialized()
    db = connections.warehouse_db
    n = 0
    with connections.pg_engine.begin() as conn:
        sla_map = _contract_sla_map(conn)
        for stg in db["stg_opm_tickets"].find({}):
            sla_hours = sla_map.get(str(stg.get("contract_source_id") or ""))
            ttr = stg.get("time_to_resolve_min")
            is_sla_breach = bool(ttr is not None and sla_hours and ttr > sla_hours * 60)
            status_sk = _upsert_status(conn,
                ticket_status=stg.get("status"), task_status=None, event_status=None,
                is_overdue=None, is_expired=stg.get("is_expired"),
                is_helpdesk=stg.get("is_helpdesk"), is_sla_breach=is_sla_breach,
                is_accepted=None)
            conn.execute(text("""
                INSERT INTO core.fact_opm_ticket (
                  source_id, ticket_number, source_system_sk,
                  created_date_sk, created_hour_sk, assigned_date_sk, resolved_date_sk, closed_date_sk,
                  contract_sk, site_sk, equipment_sk,
                  client_person_sk, assigned_technician_person_sk, status_sk,
                  time_to_assign_min, time_to_resolve_min, time_to_close_min, reopen_count
                )
                VALUES (
                  :sid, :tn,
                  (SELECT source_system_sk FROM core.dim_source_system WHERE code='OPM'),
                  :cd, :ch, :ad, :rd, :cld,
                  (SELECT contract_sk FROM core.dim_contract WHERE source_id = :ct),
                  (SELECT site_sk FROM core.dim_site WHERE source_id = :st),
                  (SELECT equipment_sk FROM core.dim_equipment WHERE source_id = :eq),
                  (SELECT person_sk FROM core.dim_person_xref WHERE source_system='OPM' AND source_user_id=:cli),
                  (SELECT person_sk FROM core.dim_person_xref WHERE source_system='OPM' AND source_user_id=:tech),
                  :status_sk, :tta, :ttr, :ttc, :rc
                )
                ON CONFLICT (source_id) DO UPDATE SET
                  status_sk                     = EXCLUDED.status_sk,
                  created_date_sk               = COALESCE(EXCLUDED.created_date_sk,               core.fact_opm_ticket.created_date_sk),
                  created_hour_sk               = COALESCE(EXCLUDED.created_hour_sk,               core.fact_opm_ticket.created_hour_sk),
                  contract_sk                   = COALESCE(EXCLUDED.contract_sk,                   core.fact_opm_ticket.contract_sk),
                  site_sk                       = COALESCE(EXCLUDED.site_sk,                       core.fact_opm_ticket.site_sk),
                  equipment_sk                  = COALESCE(EXCLUDED.equipment_sk,                  core.fact_opm_ticket.equipment_sk),
                  client_person_sk              = COALESCE(EXCLUDED.client_person_sk,              core.fact_opm_ticket.client_person_sk),
                  assigned_technician_person_sk = COALESCE(EXCLUDED.assigned_technician_person_sk, core.fact_opm_ticket.assigned_technician_person_sk),
                  resolved_date_sk              = EXCLUDED.resolved_date_sk,
                  closed_date_sk                = EXCLUDED.closed_date_sk,
                  time_to_resolve_min           = EXCLUDED.time_to_resolve_min,
                  time_to_close_min             = EXCLUDED.time_to_close_min,
                  reopen_count                  = EXCLUDED.reopen_count,
                  etl_loaded_at                 = NOW()
            """), {
                "sid": stg["source_id"], "tn": stg.get("ticket_number"),
                "cd": _date_sk(stg.get("created_at")), "ch": _hour_sk(stg.get("created_at")),
                "ad": _date_sk(stg.get("assigned_at")),
                "rd": _date_sk(stg.get("resolved_at")),
                "cld": _date_sk(stg.get("closed_at")),
                "ct":   str(stg.get("contract_source_id") or ""),
                "st":   str(stg.get("site_source_id") or ""),
                "eq":   str(stg.get("equipment_source_id") or ""),
                "cli":  str(stg.get("client_source_id") or ""),
                "tech": str(stg.get("technician_source_id") or ""),
                "status_sk": status_sk,
                "tta": stg.get("time_to_assign_min"),
                "ttr": stg.get("time_to_resolve_min"),
                "ttc": stg.get("time_to_close_min"),
                "rc":  stg.get("reopen_count") or 0,
            })
            n += 1
    return n


def load_fact_pma_task() -> int:
    connections.require_initialized()
    db = connections.warehouse_db
    n = 0
    # Build project → team_leader_source_id lookup once
    proj_tl: dict[str, str] = {}
    for p in db["stg_pma_projects"].find({}, {"source_id": 1, "team_leader_source_id": 1}):
        if p.get("team_leader_source_id"):
            proj_tl[p["source_id"]] = p["team_leader_source_id"]
    with connections.pg_engine.begin() as conn:
        for stg in db["stg_pma_tasks"].find({}):
            status_sk = _upsert_status(conn,
                ticket_status=None, task_status=stg.get("status"), event_status=None,
                is_overdue=stg.get("is_overdue"), is_expired=None,
                is_helpdesk=None, is_sla_breach=None,
                is_accepted=stg.get("is_accepted"))
            conn.execute(text("""
                INSERT INTO core.fact_pma_task (
                  source_id, task_ref, source_system_sk,
                  project_sk, executor_person_sk, team_leader_person_sk, department_sk,
                  start_date_sk, deadline_date_sk, closed_date_sk,
                  status_sk, priority_sk, progress_pct, note, rating_weight, duration_days
                )
                VALUES (
                  :sid, :ref,
                  (SELECT source_system_sk FROM core.dim_source_system WHERE code='PMA'),
                  (SELECT project_sk FROM core.dim_project WHERE source_id=:proj),
                  (SELECT person_sk FROM core.dim_person_xref WHERE source_system='PMA' AND source_user_id=:exe),
                  (SELECT person_sk FROM core.dim_person_xref WHERE source_system='PMA' AND source_user_id=:tl),
                  (SELECT dd.department_sk
                   FROM core.dim_person dp
                   JOIN core.dim_department dd ON dd.name = dp.department
                   JOIN core.dim_person_xref xr ON xr.person_sk = dp.person_sk
                   WHERE xr.source_system = 'PMA' AND xr.source_user_id = :exe
                   LIMIT 1),
                  :sd, :dd, :cd,
                  :status_sk,
                  (SELECT priority_sk FROM core.dim_priority WHERE level = COALESCE(:pri,'Unknown')),
                  :prog, :note, :rw, :dur
                )
                ON CONFLICT (source_id) DO UPDATE SET
                  status_sk             = EXCLUDED.status_sk,
                  project_sk            = COALESCE(EXCLUDED.project_sk,            core.fact_pma_task.project_sk),
                  executor_person_sk    = COALESCE(EXCLUDED.executor_person_sk,    core.fact_pma_task.executor_person_sk),
                  team_leader_person_sk = COALESCE(EXCLUDED.team_leader_person_sk, core.fact_pma_task.team_leader_person_sk),
                  department_sk         = COALESCE(EXCLUDED.department_sk,         core.fact_pma_task.department_sk),
                  start_date_sk         = COALESCE(EXCLUDED.start_date_sk,         core.fact_pma_task.start_date_sk),
                  closed_date_sk        = EXCLUDED.closed_date_sk,
                  progress_pct          = EXCLUDED.progress_pct,
                  note                  = EXCLUDED.note,
                  duration_days         = EXCLUDED.duration_days,
                  etl_loaded_at         = NOW()
            """), {
                "sid": stg["source_id"], "ref": stg.get("task_ref"),
                "proj": str(stg.get("project_source_id") or ""),
                "exe": str(stg.get("executor_source_id") or ""),
                "tl":  str(proj_tl.get(str(stg.get("project_source_id") or "")) or ""),
                "sd": _date_sk(stg.get("start_at")),
                "dd": _date_sk(stg.get("deadline_at")),
                "cd": _date_sk(stg.get("closed_at")),
                "status_sk": status_sk,
                "pri": stg.get("priority"),
                "prog": stg.get("progress_pct"),
                "note": stg.get("note"),
                "rw": stg.get("rating_weight"),
                "dur": stg.get("duration_days"),
            })
            n += 1
    return n


def load_fact_pte_event() -> int:
    connections.require_initialized()
    db = connections.warehouse_db
    n = 0
    silver_colls = [
        "stg_pte_leaves",
        "stg_pte_vehicle_events",
        "stg_pte_room_events",
        "stg_pte_virtualization",
        "stg_pte_user_events",
    ]
    with connections.pg_engine.begin() as conn:
        for coll in silver_colls:
            for stg in db[coll].find({}):
                status_sk = _upsert_status(conn,
                    ticket_status=None, task_status=None,
                    event_status=stg.get("status"),
                    is_overdue=None, is_expired=None,
                    is_helpdesk=None, is_sla_breach=None,
                    is_accepted=stg.get("is_accepted"))
                conn.execute(text("""
                    INSERT INTO core.fact_pte_event (
                      source_id, event_type, source_system_sk,
                      event_date_sk, event_hour_sk, end_date_sk,
                      applicant_person_sk, engineer_person_sk,
                      department_sk, vehicle_sk, room_sk, leave_type_sk, status_sk,
                      duration_min, km, ram_gb, disk_gb, business_days
                    )
                    VALUES (
                      :sid, :etype,
                      (SELECT source_system_sk FROM core.dim_source_system WHERE code='PTE'),
                      :sd, :sh, :ed,
                      (SELECT person_sk FROM core.dim_person_xref WHERE source_system='PTE' AND source_user_id=:app),
                      (SELECT person_sk FROM core.dim_person_xref WHERE source_system='PTE' AND source_user_id=:eng),
                      (SELECT department_sk FROM core.dim_department WHERE name=:dept),
                      (SELECT vehicle_sk FROM core.dim_vehicle WHERE source_id=:veh),
                      (SELECT room_sk FROM core.dim_room WHERE source_id=:room),
                      (SELECT leave_type_sk FROM core.dim_leave_type WHERE code=:lt),
                      :status_sk, :dur, :km, :ram, :disk, :bd
                    )
                    ON CONFLICT (source_id) DO UPDATE SET
                      status_sk     = EXCLUDED.status_sk,
                      department_sk = COALESCE(EXCLUDED.department_sk, core.fact_pte_event.department_sk),
                      leave_type_sk = COALESCE(EXCLUDED.leave_type_sk, core.fact_pte_event.leave_type_sk),
                      event_date_sk = COALESCE(EXCLUDED.event_date_sk, core.fact_pte_event.event_date_sk),
                      end_date_sk   = EXCLUDED.end_date_sk,
                      duration_min  = EXCLUDED.duration_min,
                      etl_loaded_at = NOW()
                """), {
                    "sid": stg["source_id"], "etype": stg["event_type"],
                    "sd": _date_sk(stg.get("event_start")),
                    "sh": _hour_sk(stg.get("event_start")),
                    "ed": _date_sk(stg.get("event_end")),
                    "app":  str(stg.get("applicant_source_id") or ""),
                    "eng":  str(stg.get("engineer_source_id") or ""),
                    "dept": stg.get("department"),
                    "veh":  str(stg.get("vehicle_source_id") or ""),
                    "room": str(stg.get("room_source_id") or ""),
                    "lt":   stg.get("leave_type_code"),
                    "status_sk": status_sk,
                    "dur": stg.get("duration_min"),
                    "km": stg.get("km"),
                    "ram": stg.get("ram_gb"),
                    "disk": stg.get("disk_gb"),
                    "bd": stg.get("business_days"),
                })
                n += 1
    return n


def load_all_facts() -> dict[str, int]:
    return {
        "fact_opm_ticket": load_fact_opm_ticket(),
        "fact_pma_task":   load_fact_pma_task(),
        "fact_pte_event":  load_fact_pte_event(),
    }
