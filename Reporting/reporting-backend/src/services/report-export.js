const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

function asJsonBuffer(payload) {
  return Buffer.from(JSON.stringify(payload, null, 2), 'utf-8');
}

async function asXlsxBuffer(payload) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Reporting Hub';
  wb.created = new Date();

  const summary = wb.addWorksheet('Summary');
  summary.columns = [
    { header: 'Report', key: 'name', width: 40 },
    { header: 'Generated At', key: 'generatedAt', width: 28 },
    { header: 'KPIs', key: 'kpis', width: 10 },
    { header: 'OK', key: 'ok', width: 10 },
    { header: 'Failed', key: 'failed', width: 10 },
  ];
  summary.addRow({
    name: payload.name,
    generatedAt: payload.generatedAt,
    kpis: payload.summary?.kpis ?? 0,
    ok: payload.summary?.ok ?? 0,
    failed: payload.summary?.failed ?? 0,
  });

  for (const r of payload.results || []) {
    const sheetName = `${r.source}-${r.metric}`.slice(0, 30);
    const ws = wb.addWorksheet(sheetName);
    ws.addRow(['ok', r.ok ? 'true' : 'false']);
    ws.addRow(['label', r.label]);
    if (!r.ok) {
      ws.addRow(['error', r.error || '']);
      continue;
    }

    // If FastAPI returns our standard KpiResponse, try to render its data table
    const data = r.data?.data;
    if (Array.isArray(data) && data.length) {
      const cols = Object.keys(data[0]);
      ws.addRow(cols);
      data.forEach((row) => ws.addRow(cols.map((c) => row[c])));
    } else {
      ws.addRow(['payload']);
      ws.addRow([JSON.stringify(r.data)]);
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

async function asPdfBuffer(payload) {
  const doc = new PDFDocument({ size: 'A4', margin: 48 });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));

  doc.fontSize(18).text(payload.name || 'Report', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#333333').text(`Generated at: ${payload.generatedAt}`);
  doc.moveDown(0.5);

  doc.fontSize(11).fillColor('#111111').text('Summary');
  doc.fontSize(10).fillColor('#333333').text(
    `KPIs: ${payload.summary?.kpis ?? 0}  OK: ${payload.summary?.ok ?? 0}  Failed: ${payload.summary?.failed ?? 0}`
  );
  doc.moveDown();

  for (const r of payload.results || []) {
    doc.fillColor('#111111').fontSize(11).text(`${r.source} — ${r.label}`, { continued: false });
    doc.fontSize(9).fillColor(r.ok ? '#0a7a2f' : '#b00020').text(r.ok ? 'OK' : `FAILED: ${r.error || ''}`);
    doc.moveDown(0.25);

    if (r.ok && Array.isArray(r.data?.data)) {
      const rows = r.data.data.slice(0, 12);
      rows.forEach((row) => {
        doc.fillColor('#333333').fontSize(8).text(JSON.stringify(row));
      });
    }
    doc.moveDown();
  }

  doc.end();

  return await new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

async function exportReport(payload, format) {
  if (format === 'xlsx') {
    return { contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx', buffer: await asXlsxBuffer(payload) };
  }
  if (format === 'pdf') {
    return { contentType: 'application/pdf', ext: 'pdf', buffer: await asPdfBuffer(payload) };
  }
  return { contentType: 'application/json', ext: 'json', buffer: asJsonBuffer(payload) };
}

module.exports = { exportReport };
