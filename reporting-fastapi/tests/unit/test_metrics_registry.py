from app.metrics.registry import get_metric, list_metrics


def test_registry_has_expected_metrics():
    metrics = list_metrics()
    ids = {m["metric_id"] for m in metrics}
    assert "opm.tickets.by_status" in ids
    assert "pte.leaves.by_type" in ids
    assert "pma.projects.by_status" in ids


def test_get_metric_raises_for_unknown():
    try:
        get_metric("missing.metric")
        assert False, "Expected KeyError"
    except KeyError:
        assert True
