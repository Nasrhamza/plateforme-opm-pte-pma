from app.metrics.definitions import KPI_DEFINITIONS

KPI_ALIASES = {
    "opm.tickets.by_status": "opm.tickets_by_status",
    "pte.leaves.by_type": "pte.leave_consumption",
    "pma.projects.by_status": "pma.portfolio_status",
}


def get_metric(metric_id: str) -> dict:
    metric = KPI_DEFINITIONS.get(KPI_ALIASES.get(metric_id, metric_id))
    if not metric:
        raise KeyError(f"Unknown metric: {metric_id}")
    return metric


def list_metrics() -> list[dict]:
    metrics = [{"metric_id": k, **v} for k, v in KPI_DEFINITIONS.items()]
    metrics.extend(
        {"metric_id": alias, "alias_for": canonical, **KPI_DEFINITIONS[canonical]}
        for alias, canonical in KPI_ALIASES.items()
    )
    return metrics
