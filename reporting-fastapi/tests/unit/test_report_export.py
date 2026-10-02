import os, tempfile
from app.services.report_export import _render_xlsx, _render_pdf, _render_json


SAMPLE = {
    "report_id": "r1", "name": "test", "generated_at": "2026-05-18T08:00:00Z",
    "filters": {"dateFrom": "2026-01-01"},
    "kpis": [{"kpi": "opm.tickets.by_status",
              "result": {"data": [{"status": "Resolved", "value": 12}]}}],
}


def test_json_render(tmp_path):
    p = tmp_path / "r.json"
    _render_json(SAMPLE, str(p))
    assert p.read_text().startswith("{")


def test_xlsx_render(tmp_path):
    p = tmp_path / "r.xlsx"
    _render_xlsx(SAMPLE, str(p))
    assert p.stat().st_size > 0


def test_pdf_render(tmp_path):
    p = tmp_path / "r.pdf"
    _render_pdf(SAMPLE, str(p))
    assert p.read_bytes().startswith(b"%PDF")
