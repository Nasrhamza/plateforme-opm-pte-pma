from datetime import datetime, date, timezone
from typing import Any
from dateutil.parser import isoparse

from app.db.connections import connections


def _parse_dt(value: Any) -> datetime | None:
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if isinstance(value, date):
        return datetime(value.year, value.month, value.day, tzinfo=timezone.utc)
    try:
        return isoparse(str(value))
    except Exception:
        return None


def _minutes_between(a: datetime | None, b: datetime | None) -> int | None:
    if not a or not b:
        return None
    return int((b - a).total_seconds() // 60)


def _business_days(start: datetime | None, end: datetime | None) -> int | None:
    if not start or not end:
        return None
    days = 0
    cur = start.date()
    last = end.date()
    while cur <= last:
        if cur.weekday() < 5:
            days += 1
        cur = cur.fromordinal(cur.toordinal() + 1)
    return days


def _id_of(val: Any) -> str | None:
    """Extract _id string from either a populated object or a plain ObjectId/string."""
    if isinstance(val, dict):
        return str(val["_id"]) if val.get("_id") else None
    return str(val) if val else None


def normalize_opm_ticket(raw: dict) -> dict:
    created  = _parse_dt(raw.get("creationDate") or raw.get("createdAt"))
    assigned = _parse_dt(raw.get("assignedDate") or raw.get("assignedAt"))
    resolved = _parse_dt(raw.get("resolvedDate") or raw.get("resolvedAt"))
    closed   = _parse_dt(raw.get("closedDate") or raw.get("closedAt"))
    techs = raw.get("technicienId") or []
    first_tech = techs[0] if techs else None
    return {
        "source_id":    str(raw.get("_id")),
        "ticket_number": raw.get("number") or raw.get("ticketNumber"),
        "status":        raw.get("status"),
        "created_at": created, "assigned_at": assigned,
        "resolved_at": resolved, "closed_at": closed,
        "contract_source_id":    _id_of(raw.get("contractId") or raw.get("contract")),
        "site_source_id":        _id_of(raw.get("siteId")     or raw.get("site")),
        "equipment_source_id":   _id_of(raw.get("equipmentHardId") or raw.get("equipment")),
        "client_source_id":      _id_of(raw.get("clientId")   or raw.get("client")),
        "technician_source_id":  _id_of(first_tech),
        "is_expired":   bool(raw.get("isExpired")),
        "is_helpdesk":  bool(raw.get("isHelpdesk")),
        "is_sla_breach": bool(raw.get("isSlaBreach")),
        "reopen_count": int(raw.get("reopenCount") or 0),
        "time_to_assign_min":  _minutes_between(created, assigned),
        "time_to_resolve_min": _minutes_between(created, resolved),
        "time_to_close_min":   _minutes_between(created, closed),
    }


def normalize_pma_task(raw: dict) -> dict:
    start    = _parse_dt(raw.get("StartDate") or raw.get("startDate"))
    deadline = _parse_dt(raw.get("Deadline")  or raw.get("deadline"))
    closed   = _parse_dt(raw.get("closedAt"))
    is_overdue = bool(deadline and closed and closed.date() > deadline.date())
    duration = None
    if start and closed:
        duration = (closed.date() - start.date()).days
    executors = raw.get("Executor") or raw.get("executor") or raw.get("executors") or []
    first_exec = executors[0] if executors else None
    return {
        "source_id": str(raw.get("_id")),
        "task_ref":  raw.get("ref") or raw.get("taskRef") or raw.get("Title"),
        "project_source_id":   _id_of(raw.get("Project")    or raw.get("project")),
        "executor_source_id":  _id_of(first_exec),
        "team_leader_source_id": _id_of(raw.get("teamLeader")),
        "start_at": start, "deadline_at": deadline, "closed_at": closed,
        "status":   raw.get("Status")   or raw.get("status"),
        "priority": raw.get("Priority") or raw.get("priority") or "Unknown",
        "is_overdue": is_overdue,
        "is_accepted": bool(raw.get("isAccepted")),
        "progress_pct": float(raw.get("progress") or 0),
        "note": float(raw.get("note")) if raw.get("note") else None,
        "rating_weight": float(raw.get("ratingWeight") or 1.0),
        "duration_days": duration,
    }


_LEAVE_TYPE_MAP = {
    "ANNUAL LEAVE": "PAID", "ANNUAL": "PAID", "PAID LEAVE": "PAID",
    "SICK LEAVE": "SICK", "SICK": "SICK",
    "MATERNITY LEAVE": "MATERNITY", "MATERNITY": "MATERNITY",
    "PATERNITY LEAVE": "PATERNITY", "PATERNITY": "PATERNITY",
    "UNPAID LEAVE": "UNPAID", "UNPAID": "UNPAID",
    "EMERGENCY LEAVE": "OTHER", "BEREAVEMENT LEAVE": "BEREAVEMENT",
}


def normalize_pte_leave(raw: dict) -> dict:
    start = _parse_dt(raw.get("startDate"))
    end   = _parse_dt(raw.get("endDate"))
    applicant = raw.get("applicant")
    dept = None
    if isinstance(applicant, dict):
        dept = applicant.get("departement") or applicant.get("department")
    raw_type = (raw.get("type") or "OTHER").upper().strip()
    mapped_type = _LEAVE_TYPE_MAP.get(raw_type, "OTHER")
    return {
        "source_id":           str(raw.get("_id")),
        "event_type":          "leave",
        "applicant_source_id": _id_of(applicant) or str(raw.get("user") or ""),
        "department":          dept,
        "leave_type_code":     mapped_type,
        "event_start": start, "event_end": end,
        "status":   raw.get("status"),
        "is_accepted": (raw.get("status") or "").upper() in {"APPROVED", "ACCEPTED"},
        "business_days": _business_days(start, end),
    }


def normalize_pte_vehicle_event(raw: dict) -> dict:
    start = _parse_dt(raw.get("startDate") or raw.get("startAt") or raw.get("start"))
    end = _parse_dt(raw.get("endDate") or raw.get("endAt") or raw.get("end"))
    return {
        "source_id": str(raw.get("_id")),
        "event_type": "vehicle_usage",
        "applicant_source_id": _id_of(raw.get("applicant") or raw.get("user") or raw.get("driver")),
        "vehicle_source_id": _id_of(raw.get("vehicle")),
        "event_start": start, "event_end": end,
        "status": raw.get("status"),
        "km": float(raw.get("km") or raw.get("distance") or 0),
        "duration_min": _minutes_between(start, end),
    }


def normalize_pte_room_event(raw: dict) -> dict:
    start = _parse_dt(raw.get("startDate") or raw.get("startAt") or raw.get("start"))
    end = _parse_dt(raw.get("endDate") or raw.get("endAt") or raw.get("end"))
    return {
        "source_id": str(raw.get("_id")),
        "event_type": "room_reservation",
        "applicant_source_id": _id_of(raw.get("applicant") or raw.get("user") or raw.get("reservedBy")),
        "room_source_id": _id_of(raw.get("room")),
        "event_start": start, "event_end": end,
        "status": raw.get("status"),
        "duration_min": _minutes_between(start, end),
    }


def normalize_pte_vm(raw: dict) -> dict:
    return {
        "source_id": str(raw.get("_id")),
        "event_type": "vm_request",
        "applicant_source_id": _id_of(raw.get("applicant") or raw.get("user") or raw.get("requestedBy")),
        "event_start": _parse_dt(raw.get("requestedAt") or raw.get("createdAt") or raw.get("start")),
        "event_end": _parse_dt(raw.get("grantedAt") or raw.get("approvedAt") or raw.get("end")),
        "status": raw.get("status"),
        "ram_gb": int(str(raw.get("ramGb") or raw.get("ram") or "0").replace("GB","").strip() or 0) or None,
        "disk_gb": int(str(raw.get("diskGb") or raw.get("disk") or "0").replace("GB","").strip() or 0) or None,
    }


def normalize_pte_intervention(raw: dict) -> dict:
    start = _parse_dt(raw.get("startDate") or raw.get("startAt") or raw.get("start"))
    end = _parse_dt(raw.get("endDate") or raw.get("endAt") or raw.get("end"))
    return {
        "source_id": str(raw.get("_id")),
        "event_type": "intervention",
        "applicant_source_id": _id_of(raw.get("applicant") or raw.get("user")),
        "engineer_source_id": _id_of(raw.get("engineer") or raw.get("assignedTo")),
        "event_start": start, "event_end": end,
        "status": raw.get("status"),
        "duration_min": _minutes_between(start, end),
    }


def normalize_opm_client(raw: dict) -> dict:
    fn = raw.get("firstName") or raw.get("firstname") or ""
    ln = raw.get("lastName")  or raw.get("lastname")  or ""
    return {
        "source_id": str(raw.get("_id")),
        "company":   raw.get("company") or raw.get("companyName") or f"{fn} {ln}".strip() or None,
        "email":     (raw.get("email") or "").strip().lower() or None,
    }


def normalize_opm_contract(raw: dict) -> dict:
    commercial = raw.get("commercial") or raw.get("commercialId")
    commercial_name = None
    if isinstance(commercial, dict):
        fn = commercial.get("firstName") or commercial.get("firstname") or ""
        ln = commercial.get("lastName")  or commercial.get("lastname")  or ""
        commercial_name = f"{fn} {ln}".strip() or commercial.get("fullName") or commercial.get("name")
    # clients is an array of IDs; client_name resolved at load time via stg_opm_clients
    client_ids = [str(c) for c in (raw.get("clients") or []) if c]
    site_ids   = [str(s) for s in (raw.get("listSite") or []) if s]
    return {
        "source_id":              str(raw.get("_id")),
        "contract_number":        raw.get("id") or raw.get("contractNumber"),
        "type":                   raw.get("type"),
        "nature":                 raw.get("nature"),
        "sla":                    raw.get("sla"),
        "start_date":             _parse_dt(raw.get("startDate")),
        "end_date":               _parse_dt(raw.get("endDate")),
        "client_source_ids":      client_ids,
        "list_site_ids":          site_ids,
        "commercial_person_name": commercial_name,
    }


def normalize_opm_site(raw: dict) -> dict:
    equip_ids = [str(e) for e in (raw.get("listEquipment") or []) if e]
    return {
        "source_id":           str(raw.get("_id")),
        "name":                raw.get("nomSite") or raw.get("name"),
        "address":             raw.get("adress") or raw.get("address"),
        "lat":                 raw.get("latitude"),
        "lon":                 raw.get("longitude"),
        "list_equipment_ids":  equip_ids,
        # client_name resolved at load time from stg_opm_contracts → stg_opm_clients
    }


def normalize_opm_equipment(raw: dict) -> dict:
    return {
        "source_id":     str(raw.get("_id")),
        "serial_number": raw.get("serialNumber") or raw.get("SN"),
        "name":          raw.get("name") or raw.get("nomPice"),
        "version":       raw.get("version"),
        "constructor":   raw.get("constructor") or raw.get("brand"),
        # site_name and contract_number resolved at load time via reverse lookups
    }


def normalize_pma_reclamation(raw: dict) -> dict:
    project = raw.get("project")
    client  = raw.get("client")
    return {
        "source_id":         str(raw.get("_id")),
        "code":              raw.get("CodeRec"),
        "title":             raw.get("Title"),
        "reclamation_type":  raw.get("Type_Reclamation"),
        "status":            raw.get("status"),
        "added_date":        _parse_dt(raw.get("Addeddate")),
        "project_source_id": _id_of(project),
        "client_source_id":  _id_of(client),
    }


def normalize_pma_project(raw: dict) -> dict:
    tl = raw.get("TeamLeader")
    tl_id = str(tl.get("_id")) if isinstance(tl, dict) else str(tl) if tl else None
    return {
        "source_id":  str(raw.get("_id")),
        "name":       raw.get("Projectname") or raw.get("name"),
        "type":       raw.get("type"),
        "priority":   raw.get("priority"),
        "status":     raw.get("status"),
        "team_leader_source_id": tl_id,
        "start_date": _parse_dt(raw.get("dateDebut")),
        "end_date":   _parse_dt(raw.get("dateFin")),
        "closed_at":  _parse_dt(raw.get("closedAt")),
    }


def normalize_pte_vehicle(raw: dict) -> dict:
    reg = raw.get("registration_number") or raw.get("registration") or raw.get("plate")
    return {
        "source_id":    str(raw.get("_id")),
        "registration": reg,
        "model":        raw.get("model"),
        "type":         raw.get("type"),
    }


def normalize_pte_room(raw: dict) -> dict:
    return {
        "source_id": str(raw.get("_id")),
        "label":     raw.get("label") or raw.get("name"),
        "location":  raw.get("location"),
        "capacity":  raw.get("capacity"),
    }


def _normalize_user(raw: dict) -> dict:
    """Generic user normalizer — extracts MDM-relevant fields for all 3 sources."""
    uid = raw.get("_id") or raw.get("id") or ""
    email = (raw.get("email") or "").strip().lower()
    first = raw.get("firstName") or raw.get("firstname") or ""
    last  = raw.get("lastName")  or raw.get("lastname")  or ""
    full  = raw.get("fullName")  or raw.get("name") or ""
    if first or last:
        full = f"{first} {last}".strip()
    dept = raw.get("department") or raw.get("departement")
    if isinstance(dept, dict):
        dept = dept.get("name") or dept.get("departement")
    return {
        "source_id":  str(uid),
        "email":      email,
        "firstName":  first,
        "lastName":   last,
        "fullName":   full,
        "department": dept,
        "gender":     raw.get("gender") or raw.get("sexe"),
        "title":      raw.get("title") or raw.get("role") or raw.get("authority"),
        "isEnabled":  bool(raw.get("isEnabled", True)),
        "isDeleted":  bool(raw.get("isDeleted", False)),
    }


NORMALIZERS = {
    "raw_opm_tickets":         ("stg_opm_tickets",         normalize_opm_ticket),
    "raw_opm_contracts":       ("stg_opm_contracts",       normalize_opm_contract),
    "raw_opm_clients":         ("stg_opm_clients",         normalize_opm_client),
    "raw_opm_sites":           ("stg_opm_sites",           normalize_opm_site),
    "raw_opm_equipment":       ("stg_opm_equipment",       normalize_opm_equipment),
    "raw_opm_equipment_soft":  ("stg_opm_equipment_soft",  normalize_opm_equipment),
    "raw_pma_tasks":           ("stg_pma_tasks",           normalize_pma_task),
    "raw_pma_projects":        ("stg_pma_projects",        normalize_pma_project),
    "raw_pma_reclamations":    ("stg_pma_reclamations",    normalize_pma_reclamation),
    "raw_pte_leaves":          ("stg_pte_leaves",          normalize_pte_leave),
    "raw_pte_vehicle_events":  ("stg_pte_vehicle_events",  normalize_pte_vehicle_event),
    "raw_pte_room_events":     ("stg_pte_room_events",     normalize_pte_room_event),
    "raw_pte_virtualization":  ("stg_pte_virtualization",  normalize_pte_vm),
    "raw_pte_user_events":     ("stg_pte_user_events",     normalize_pte_intervention),
    "raw_pte_vehicles":        ("stg_pte_vehicles",        normalize_pte_vehicle),
    "raw_pte_rooms":           ("stg_pte_rooms",           normalize_pte_room),
    "raw_opm_users":           ("stg_opm_users",           _normalize_user),
    "raw_pma_users":           ("stg_pma_users",           _normalize_user),
    "raw_pte_users":           ("stg_pte_users",           _normalize_user),
}


def run_silver(etl_run_id: str | None = None) -> dict[str, int]:
    """Read latest bronze docs per source_id and upsert into stg_* by source_id."""
    connections.require_initialized()
    db = connections.warehouse_db
    counts: dict[str, int] = {}
    now = datetime.now(timezone.utc)
    for bronze_name, (silver_name, fn) in NORMALIZERS.items():
        pipeline = [
            {"$sort": {"ingested_at": -1}},
            {"$group": {"_id": "$source_id", "doc": {"$first": "$payload"}}},
        ]
        if etl_run_id:
            pipeline.insert(0, {"$match": {"etl_run_id": etl_run_id}})
        bulk = 0
        for row in db[bronze_name].aggregate(pipeline):
            typed = fn(row["doc"])
            typed["updated_at"] = now
            db[silver_name].update_one({"source_id": typed["source_id"]},
                                       {"$set": typed}, upsert=True)
            bulk += 1
        counts[silver_name] = bulk
    return counts
