const router = require('express').Router();
const ctrl = require('../controllers/data.controller');
const { authMiddleware } = require('../middlewares/auth');

router.use(authMiddleware);

// OPM
router.get('/opm/tickets/by-status',      ctrl.getTicketsByStatus);
router.get('/opm/tickets/by-period',      ctrl.getTicketsByPeriod);
router.get('/opm/tickets/by-technician',  ctrl.getTicketsByTech);
router.get('/opm/tickets/resolution-rate',ctrl.getResolutionRate);
router.get('/opm/tickets/expired',        ctrl.getExpiredTickets);
router.get('/opm/tickets/sla-compliance', ctrl.getSlaCompliance);
router.get('/opm/tickets/recent',         ctrl.getRecentTickets);

// PTE
router.get('/pte/leaves/by-type',         ctrl.getLeaveByType);
router.get('/pte/leaves/by-department',   ctrl.getLeaveByDepartment);
router.get('/pte/vehicles/usage',         ctrl.getVehicleUsage);
router.get('/pte/vehicles/gas-consumption',ctrl.getGasConsumption);
router.get('/pte/missions',               ctrl.getMissions);
router.get('/pte/missions/list',          ctrl.getMissionsList);
router.get('/pte/rooms/utilization',      ctrl.getRoomUtilization);
router.get('/pte/users/headcount',        ctrl.getHeadcount);
router.get('/pte/virtualization/requests',ctrl.getVirtRequests);

// PMA
router.get('/pma/projects/by-status',     ctrl.getProjectsByStatus);
router.get('/pma/projects/overdue',       ctrl.getProjectsOverdue);
router.get('/pma/tasks/by-status',        ctrl.getTasksByStatus);
router.get('/pma/tasks/by-priority',      ctrl.getTasksByPriority);
router.get('/pma/tasks/workload',         ctrl.getWorkload);
router.get('/pma/reclamations',           ctrl.getReclamations);
router.get('/pma/ratings',                ctrl.getRatings);
router.get('/meta/options',               ctrl.getMetadataOptions);

module.exports = router;
