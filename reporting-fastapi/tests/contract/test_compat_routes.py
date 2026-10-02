from fastapi.testclient import TestClient

from app.main import app


def _fake_run_metric_query(metric_id, dimensions, filters, limit=100):
    return {
        "metric": metric_id,
        "dimensions": dimensions,
        "filters": filters,
        "period": "month",
        "data": [],
        "generatedAt": "2026-01-01T00:00:00Z",
        "freshness": {"source": "warehouse", "strategy": "test"},
    }


def test_opm_compat_routes(monkeypatch):
    from app.api.routes import opm

    monkeypatch.setattr(opm, "run_metric_query", _fake_run_metric_query)
    client = TestClient(app)
    assert client.get("/opm/tickets/by-status").status_code == 200
    assert client.get("/opm/tickets/by-period").status_code == 200
    assert client.get("/opm/tickets/by-technician").status_code == 200
    assert client.get("/opm/tickets/resolution-rate").status_code == 200
    assert client.get("/opm/tickets/expired").status_code == 200
    assert client.get("/opm/tickets/sla-compliance").status_code == 200


def test_pte_compat_routes(monkeypatch):
    from app.api.routes import pte

    monkeypatch.setattr(pte, "run_metric_query", _fake_run_metric_query)
    client = TestClient(app)
    assert client.get("/pte/leaves/by-type").status_code == 200
    assert client.get("/pte/leaves/by-department").status_code == 200
    assert client.get("/pte/vehicles/usage").status_code == 200
    assert client.get("/pte/vehicles/gas-consumption").status_code == 200
    assert client.get("/pte/missions").status_code == 200
    assert client.get("/pte/rooms/utilization").status_code == 200
    assert client.get("/pte/users/headcount").status_code == 200
    assert client.get("/pte/virtualization/requests").status_code == 200


def test_pma_compat_routes(monkeypatch):
    from app.api.routes import pma

    monkeypatch.setattr(pma, "run_metric_query", _fake_run_metric_query)
    client = TestClient(app)
    assert client.get("/pma/projects/by-status").status_code == 200
    assert client.get("/pma/projects/overdue").status_code == 200
    assert client.get("/pma/tasks/by-status").status_code == 200
    assert client.get("/pma/tasks/by-priority").status_code == 200
    assert client.get("/pma/tasks/workload").status_code == 200
    assert client.get("/pma/reclamations").status_code == 200
    assert client.get("/pma/ratings").status_code == 200
