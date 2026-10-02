from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import text

from app.db.connections import connections
from app.metrics.registry import get_metric

ALLOWED_FILTERS = frozenset(
    [
        "period",
        "contract",
        "client",
        "department",
        "leave_type",
        "vehicle",
        "room",
        "technician",
        "team_leader",
        "engineer",
        "project",
        "status",
        "date_from",
        "date_to",
    ]
)


def _parse_iso_date(value: str | None) -> datetime | None:
    if not value:
        return None
    parsed = datetime.fromisoformat(value)
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _comparison_window(filters: dict[str, Any]) -> dict[str, Any] | None:
    start = _parse_iso_date(filters.get("date_from"))
    end = _parse_iso_date(filters.get("date_to"))
    if not start or not end or end <= start:
        return None
    delta = end - start
    return {
        "date_from": (start - delta).isoformat(),
        "date_to": start.isoformat(),
    }


def _build_where(filters: dict[str, Any], has_period: bool = True) -> tuple[str, dict[str, Any]]:
    clauses: list[str] = []
    params: dict[str, Any] = {}
    for key, value in filters.items():
        if key not in ALLOWED_FILTERS or value is None:
            continue
        if key == "date_from":
            if has_period:
                clauses.append("period >= :date_from")
                params["date_from"] = str(value)[:10]  # YYYY-MM-DD
        elif key == "date_to":
            if has_period:
                clauses.append("period <= :date_to")
                params["date_to"] = str(value)[:10]  # YYYY-MM-DD
        else:
            clauses.append(f"{key} = :{key}")
            params[key] = value
    where = (" WHERE " + " AND ".join(clauses)) if clauses else ""
    return where, params


def _sum_values(rows: list[dict[str, Any]]) -> float:
    return float(sum(float(r.get("value", 0) or 0) for r in rows))


def run_metric_query(
    metric_id: str,
    dimensions: list[str],
    filters: dict[str, Any],
    limit: int = 500,
    include_comparison: bool = True,
) -> dict[str, Any]:
    metric = get_metric(metric_id)
    schema = metric["schema"]
    view = metric["view"]

    active_dims = dimensions or metric["group_by"]
    has_period = "period" in metric.get("group_by", [])
    where, params = _build_where(filters, has_period=has_period)
    params["lim"] = int(limit)

    if active_dims:
        cols = ", ".join(active_dims) + ", value"
    else:
        cols = "value"

    sql = f"SELECT {cols} FROM {schema}.{view}{where} ORDER BY value DESC NULLS LAST LIMIT :lim"

    with connections.pg_engine.connect() as conn:
        rows = [dict(r._mapping) for r in conn.execute(text(sql), params)]

    response: dict[str, Any] = {
        "metric": metric_id,
        "dimensions": active_dims,
        "filters": filters,
        "data": rows,
        "generatedAt": datetime.now(timezone.utc),
        "freshness": {"source": "warehouse", "strategy": "near-real-time"},
    }

    if include_comparison:
        window = _comparison_window(filters)
        if window:
            prev_filters = {**filters, **window}
            prev = run_metric_query(metric_id, dimensions, prev_filters, limit, include_comparison=False)
            current_total = _sum_values(rows)
            previous_total = _sum_values(prev["data"])
            delta = current_total - previous_total
            response["comparison"] = {
                "current_total": current_total,
                "previous_total": previous_total,
                "delta": delta,
                "delta_rate": (delta / previous_total) if previous_total else None,
                "previous_filters": prev_filters,
            }

    return response
