from fastapi.testclient import TestClient

from app.main import app


def test_metrics_query_endpoint(monkeypatch):
    from app.api.routes import metrics

    monkeypatch.setattr(
        metrics,
        "run_metric_query",
        lambda metric_id, dimensions, filters, limit=100: {
            "metric": metric_id,
            "dimensions": dimensions,
            "filters": filters,
            "period": "month",
            "data": [{"status": "Open", "value": 10}],
            "generatedAt": "2026-01-01T00:00:00Z",
            "freshness": {"source": "warehouse", "strategy": "test"},
        },
    )
    client = TestClient(app)
    res = client.post(
        "/metrics/query",
        json={"metricId": "opm.tickets.by_status", "dimensions": ["status"], "filters": {}, "limit": 10},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["metric"] == "opm.tickets.by_status"
