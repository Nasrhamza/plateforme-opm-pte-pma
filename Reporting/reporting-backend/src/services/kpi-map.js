// Map ReportConfig KPI "metric" keys to FastAPI paths.
// These paths are relative to FASTAPI_URL and match the existing proxy design.

const KPI_PATHS = {
  OPM: {
    tickets_by_status: '/opm/tickets/by-status',
    tickets_by_period: '/opm/tickets/by-period',
    tickets_by_technician: '/opm/tickets/by-technician',
    resolution_rate: '/opm/tickets/resolution-rate',
    expired_tickets: '/opm/tickets/expired',
    sla_compliance: '/opm/tickets/sla-compliance',
  },
  PTE: {
    leaves_by_type: '/pte/leaves/by-type',
    leaves_by_department: '/pte/leaves/by-department',
    vehicle_usage: '/pte/vehicles/usage',
    gas_consumption: '/pte/vehicles/gas-consumption',
    missions: '/pte/missions',
    room_utilization: '/pte/rooms/utilization',
    headcount: '/pte/users/headcount',
    virtualization_requests: '/pte/virtualization/requests',
  },
  PMA: {
    projects_by_status: '/pma/projects/by-status',
    projects_overdue: '/pma/projects/overdue',
    tasks_by_status: '/pma/tasks/by-status',
    tasks_by_priority: '/pma/tasks/by-priority',
    workload: '/pma/tasks/workload',
    reclamations: '/pma/reclamations',
    ratings: '/pma/ratings',
  },
};

const resolveKpiPath = (source, metric) => KPI_PATHS?.[source]?.[metric] || null;

module.exports = { KPI_PATHS, resolveKpiPath };
