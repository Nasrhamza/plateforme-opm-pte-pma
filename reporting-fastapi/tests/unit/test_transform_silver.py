from datetime import datetime, timezone
from app.etl.transform_silver import normalize_opm_ticket, normalize_pte_leave, normalize_pma_task


def test_normalize_opm_ticket_typed():
    raw = {
        "_id": "tk1", "ticketNumber": "T-001", "status": "Resolved",
        "createdAt": "2026-03-04T08:30:00Z",
        "assignedAt": "2026-03-04T09:00:00Z",
        "resolvedAt": "2026-03-04T11:30:00Z",
        "closedAt": None,
        "contract": "c1", "site": "s1", "equipment": "e1",
        "client": "u1", "assignedTo": "u2",
        "isExpired": False, "isHelpdesk": True, "reopenCount": 0,
    }
    out = normalize_opm_ticket(raw)
    assert out["source_id"] == "tk1"
    assert out["ticket_number"] == "T-001"
    assert out["status"] == "Resolved"
    assert isinstance(out["created_at"], datetime)
    assert out["time_to_assign_min"] == 30
    assert out["time_to_resolve_min"] == 180
    assert out["closed_at"] is None


def test_normalize_pte_leave_business_days():
    raw = {"_id": "l1", "user": "u1", "type": "PAID",
           "startDate": "2026-03-02", "endDate": "2026-03-06", "status": "APPROVED"}
    out = normalize_pte_leave(raw)
    assert out["business_days"] == 5  # Mon-Fri


def test_normalize_pma_task_overdue_derived():
    raw = {"_id": "t1", "project": "p1", "executor": "u1",
           "startDate": "2026-02-01", "deadline": "2026-02-10",
           "closedAt": "2026-02-15", "status": "Closed", "priority": "High",
           "note": 4.5, "progress": 100}
    out = normalize_pma_task(raw)
    assert out["is_overdue"] is True  # closed > deadline
    assert out["priority"] == "High"
