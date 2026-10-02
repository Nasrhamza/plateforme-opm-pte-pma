const axios = require('axios');
const { resolveKpiPath } = require('./kpi-map');

const FASTAPI = () => process.env.FASTAPI_URL;

function buildQueryFromFilters(filters) {
  const q = {};
  if (!filters) return q;
  if (filters.dateFrom) q.dateFrom = filters.dateFrom;
  if (filters.dateTo) q.dateTo = filters.dateTo;
  // keep period/clients/departments for future FastAPI support
  if (filters.period) q.period = filters.period;
  if (filters.clients?.length) q.clients = filters.clients.join(',');
  if (filters.departments?.length) q.departments = filters.departments.join(',');
  return q;
}

async function fetchKpi(kpi, filters) {
  const path = resolveKpiPath(kpi.source, kpi.metric);
  if (!path) {
    return {
      ok: false,
      source: kpi.source,
      metric: kpi.metric,
      label: kpi.label || kpi.metric,
      error: 'Unknown metric mapping',
    };
  }
  try {
    const res = await axios.get(`${FASTAPI()}${path}`, { params: buildQueryFromFilters(filters) });
    return {
      ok: true,
      source: kpi.source,
      metric: kpi.metric,
      label: kpi.label || kpi.metric,
      data: res.data,
    };
  } catch (err) {
    const status = err.response?.status || 502;
    const message = err.response?.data?.detail || err.response?.data?.message || 'FastAPI unreachable';
    return {
      ok: false,
      source: kpi.source,
      metric: kpi.metric,
      label: kpi.label || kpi.metric,
      error: message,
      status,
    };
  }
}

async function runReport(config) {
  const startedAt = new Date().toISOString();
  const results = await Promise.all((config.kpis || []).map((kpi) => fetchKpi(kpi, config.filters)));
  const ok = results.filter((r) => r.ok).length;
  const failed = results.length - ok;
  return {
    reportId: String(config._id),
    name: config.name,
    generatedAt: startedAt,
    summary: {
      kpis: results.length,
      ok,
      failed,
    },
    results,
    filters: config.filters,
  };
}

module.exports = { runReport };
