from datetime import datetime, timezone
from typing import Any


def _as_utc(value: datetime | str | None) -> datetime:
    if value is None:
        return datetime.now(timezone.utc)
    if isinstance(value, str):
        raw = value.strip()
        if not raw:
            return datetime.now(timezone.utc)
        # Accept common API formats, including trailing Z.
        if raw.endswith("Z"):
            raw = raw[:-1] + "+00:00"
        try:
            parsed = datetime.fromisoformat(raw)
            if parsed.tzinfo is None:
                return parsed.replace(tzinfo=timezone.utc)
            return parsed.astimezone(timezone.utc)
        except ValueError:
            return datetime.now(timezone.utc)
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _to_fact_ticket(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "source_id": str(doc.get("_id")),
        "created_at": _as_utc(doc.get("createdAt")),
        "updated_at": _as_utc(doc.get("updatedAt")),
        "status": doc.get("status", "Unknown"),
        "technician_id": str(doc.get("technician")) if doc.get("technician") else None,
        "client_id": str(doc.get("client")) if doc.get("client") else None,
        "is_expired": bool(doc.get("isExpired", False)),
    }


def _to_fact_leave(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "source_id": str(doc.get("_id")),
        "created_at": _as_utc(doc.get("createdAt")),
        "updated_at": _as_utc(doc.get("updatedAt")),
        "start_date": _as_utc(doc.get("startDate")),
        "leave_type": doc.get("type", "Unknown"),
        "department": doc.get("department", "Unknown"),
        "status": doc.get("status", "Unknown"),
    }


def _to_fact_vehicle(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "source_id": str(doc.get("_id")),
        "date": _as_utc(doc.get("date")),
        "created_at": _as_utc(doc.get("createdAt")),
        "updated_at": _as_utc(doc.get("updatedAt")),
        "vehicle_type": doc.get("type", "Unknown"),
        "distance": float(doc.get("distance", 0) or 0),
        "gas_consumption": float(doc.get("consumption", 0) or 0),
        "is_mission": bool(doc.get("mission", False)),
    }


def _to_fact_room(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "source_id": str(doc.get("_id")),
        "created_at": _as_utc(doc.get("createdAt")),
        "updated_at": _as_utc(doc.get("updatedAt")),
        "room": doc.get("name", "Unknown"),
        "utilization_rate": float(doc.get("utilizationRate", 0) or 0),
    }


def _to_fact_virtualization(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "source_id": str(doc.get("_id")),
        "created_at": _as_utc(doc.get("createdAt")),
        "updated_at": _as_utc(doc.get("updatedAt")),
        "status": doc.get("status", "Unknown"),
    }


def _to_dim_user(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "source_id": str(doc.get("_id")),
        "full_name": doc.get("fullName") or doc.get("name"),
        "department": doc.get("department", "Unknown"),
        "role": doc.get("role", "Unknown"),
        "updated_at": _as_utc(doc.get("updatedAt")),
    }


def _to_fact_project(doc: dict[str, Any]) -> dict[str, Any]:
    due_date = _as_utc(doc.get("dueDate")) if doc.get("dueDate") else None
    now = datetime.now(timezone.utc)
    return {
        "source_id": str(doc.get("_id")),
        "created_at": _as_utc(doc.get("createdAt")),
        "updated_at": _as_utc(doc.get("updatedAt")),
        "status": doc.get("status", "Unknown"),
        "team_leader_id": str(doc.get("teamLeader")) if doc.get("teamLeader") else None,
        "is_overdue": bool(due_date and due_date < now and doc.get("status") != "Completed"),
    }


def _to_fact_task(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "source_id": str(doc.get("_id")),
        "created_at": _as_utc(doc.get("createdAt")),
        "updated_at": _as_utc(doc.get("updatedAt")),
        "status": doc.get("status", "Unknown"),
        "priority": doc.get("priority", "Unknown"),
        "project_id": str(doc.get("project")) if doc.get("project") else None,
        "executor_id": str(doc.get("executor")) if doc.get("executor") else None,
    }


def _to_fact_reclamation(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "source_id": str(doc.get("_id")),
        "created_at": _as_utc(doc.get("createdAt")),
        "updated_at": _as_utc(doc.get("updatedAt")),
        "status": doc.get("status", "Unknown"),
        "project_id": str(doc.get("project")) if doc.get("project") else None,
    }


def _to_fact_rating(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "source_id": str(doc.get("_id")),
        "created_at": _as_utc(doc.get("createdAt")),
        "updated_at": _as_utc(doc.get("updatedAt")),
        "project_id": str(doc.get("project")) if doc.get("project") else None,
        "rating": float(doc.get("finalRating", 0) or 0),
    }


def transform_extracted(extracted: dict[str, dict[str, list[dict]]]) -> dict[str, list[dict]]:
    opm = extracted.get("opm", {})
    pte = extracted.get("pte", {})
    pma = extracted.get("pma", {})
    return {
        "fact_tickets": [_to_fact_ticket(d) for d in opm.get("tickets", [])],
        "fact_leaves": [_to_fact_leave(d) for d in pte.get("leaves", [])],
        "fact_vehicle_usage": [_to_fact_vehicle(d) for d in pte.get("vehicles", [])],
        "fact_room_usage": [_to_fact_room(d) for d in pte.get("rooms", [])],
        "fact_virtualization_requests": [_to_fact_virtualization(d) for d in pte.get("virtualization", [])],
        "dim_user": [_to_dim_user(d) for d in pte.get("users", [])],
        "fact_projects": [_to_fact_project(d) for d in pma.get("projects", [])],
        "fact_tasks": [_to_fact_task(d) for d in pma.get("tasks", [])],
        "fact_reclamations": [_to_fact_reclamation(d) for d in pma.get("reclamations", [])],
        "fact_ratings": [_to_fact_rating(d) for d in pma.get("ratings", [])],
    }
