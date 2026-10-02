import time

from fastapi.testclient import TestClient

from app.main import app


def test_metrics_query_perf_smoke(monkeypatch):
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
    start = time.perf_counter()
    response = client.post(
        "/metrics/query",
        json={"metricId": "opm.tickets.by_status", "dimensions": ["status"], "filters": {}, "limit": 10},
    )
    elapsed_ms = (time.perf_counter() - start) * 1000
    assert response.status_code == 200
    assert elapsed_ms < 500
