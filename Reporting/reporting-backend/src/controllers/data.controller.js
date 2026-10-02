const axios = require('axios');

const FASTAPI = () => process.env.FASTAPI_URL;

// Proxy requests to FastAPI with optional filters passed as query params
const proxy = async (req, res, path) => {
  try {
    const response = await axios.get(`${FASTAPI()}${path}`, { params: req.query });
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 502;
    const message = err.response?.data?.detail || 'FastAPI unreachable';
    res.status(status).json({ message });
  }
};

// OPM
const getTicketsByStatus   = (req, res) => proxy(req, res, '/opm/tickets/by-status');
const getTicketsByPeriod   = (req, res) => proxy(req, res, '/opm/tickets/by-period');
const getTicketsByTech     = (req, res) => proxy(req, res, '/opm/tickets/by-technician');
const getResolutionRate    = (req, res) => proxy(req, res, '/opm/tickets/resolution-rate');
const getExpiredTickets    = (req, res) => proxy(req, res, '/opm/tickets/expired');
const getSlaCompliance     = (req, res) => proxy(req, res, '/opm/tickets/sla-compliance');
const getRecentTickets     = (req, res) => proxy(req, res, '/opm/tickets/recent');

// PTE
const getLeaveByType       = (req, res) => proxy(req, res, '/pte/leaves/by-type');
const getLeaveByDepartment = (req, res) => proxy(req, res, '/pte/leaves/by-department');
const getVehicleUsage      = (req, res) => proxy(req, res, '/pte/vehicles/usage');
const getGasConsumption    = (req, res) => proxy(req, res, '/pte/vehicles/gas-consumption');
const getMissions          = (req, res) => proxy(req, res, '/pte/missions');
const getMissionsList      = (req, res) => proxy(req, res, '/pte/missions/list');
const getRoomUtilization   = (req, res) => proxy(req, res, '/pte/rooms/utilization');
const getHeadcount         = (req, res) => proxy(req, res, '/pte/users/headcount');
const getVirtRequests      = (req, res) => proxy(req, res, '/pte/virtualization/requests');

// PMA
const getProjectsByStatus  = (req, res) => proxy(req, res, '/pma/projects/by-status');
const getProjectsOverdue   = (req, res) => proxy(req, res, '/pma/projects/overdue');
const getTasksByStatus     = (req, res) => proxy(req, res, '/pma/tasks/by-status');
const getTasksByPriority   = (req, res) => proxy(req, res, '/pma/tasks/by-priority');
const getWorkload          = (req, res) => proxy(req, res, '/pma/tasks/workload');
const getReclamations      = (req, res) => proxy(req, res, '/pma/reclamations');
const getRatings           = (req, res) => proxy(req, res, '/pma/ratings');

const getMetadataOptions   = (req, res) => proxy(req, res, '/meta/options');

module.exports = {
  // OPM
  getTicketsByStatus, getTicketsByPeriod, getTicketsByTech,
  getResolutionRate, getExpiredTickets, getSlaCompliance, getRecentTickets,
  // PTE
  getLeaveByType, getLeaveByDepartment, getVehicleUsage,
  getGasConsumption, getMissions, getMissionsList, getRoomUtilization,
  getHeadcount, getVirtRequests,
  // PMA
  getProjectsByStatus, getProjectsOverdue, getTasksByStatus,
  getTasksByPriority, getWorkload, getReclamations, getRatings,
  getMetadataOptions,
};
