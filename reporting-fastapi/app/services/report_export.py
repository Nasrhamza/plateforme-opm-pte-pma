import json
import os
from pathlib import Path
from uuid import uuid4

from openpyxl import Workbook
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, Spacer

from app.core.config import get_settings


def _output_path(report_id: str, fmt: str) -> str:
    base = Path(get_settings().reports_storage_path) / report_id
    base.mkdir(parents=True, exist_ok=True)
    return str(base / f"{uuid4().hex}.{fmt}")


def _render_json(bundle: dict, path: str) -> None:
    Path(path).write_text(json.dumps(bundle, indent=2, default=str), encoding="utf-8")


def _render_xlsx(bundle: dict, path: str) -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = "Summary"
    ws.append(["Report", bundle.get("name")])
    ws.append(["Generated", bundle.get("generated_at")])
    for kb in bundle["kpis"]:
        sheet = wb.create_sheet(kb["kpi"][:31])
        data = kb["result"].get("data") or []
        if not data:
            sheet.append(["(empty)"])
            continue
        cols = list(data[0].keys())
        sheet.append(cols)
        for row in data:
            sheet.append([row.get(c) for c in cols])
    wb.save(path)


def _render_pdf(bundle: dict, path: str) -> None:
    doc = SimpleDocTemplate(path, pagesize=A4)
    styles = getSampleStyleSheet()
    flow = [Paragraph(bundle.get("name", "Report"), styles["Title"]),
            Paragraph(f"Generated: {bundle.get('generated_at')}", styles["Normal"]),
            Spacer(1, 12)]
    for kb in bundle["kpis"]:
        flow.append(Paragraph(kb["kpi"], styles["Heading2"]))
        data = kb["result"].get("data") or []
        if not data:
            flow.append(Paragraph("(no data)", styles["Normal"]))
            continue
        cols = list(data[0].keys())
        rows = [cols] + [[str(r.get(c, "")) for c in cols] for r in data]
        flow.append(Table(rows))
        flow.append(Spacer(1, 12))
    doc.build(flow)


def export_report(report_id: str, fmt: str, bundle: dict) -> str:
    path = _output_path(report_id, fmt)
    if fmt == "pdf":
        _render_pdf(bundle, path)
    elif fmt == "xlsx":
        _render_xlsx(bundle, path)
    else:
        _render_json(bundle, path)
    return path
