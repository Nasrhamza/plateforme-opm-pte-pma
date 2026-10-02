const express = require('express');
const router = express.Router();
const kpis2Controller = require('../controllers/kpi2.controller');
const kpisController = require('../controllers/kpis.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');


router.get('/average-project-duration', authMiddleware, kpisController.getAverageProjectDuration);
router.get('/on-time-delivery-rate', authMiddleware, kpisController.getOnTimeDeliveryRate);
router.get('/late-projects-count', authMiddleware, kpisController.getLateProjectsCount);
router.get('/project-status-ratio', authMiddleware, kpisController.getProjectStatusRatio);
router.get('/projects-by-team-leaders', authMiddleware, kpisController.getProjectsByTeamLeaders);
router.get('/projects/stats', authMiddleware, kpisController.getProjectsStats);
router.get('/projects-by-engineer', authMiddleware, kpisController.getProjectsByEngineer);
router.get('/top-5-longest-projects', authMiddleware, kpisController.getTop5LongestProjects);
router.get('/top-5-shortest-projects', authMiddleware, kpisController.getTop5ShortestProjects);
router.get('/late-task-rate', authMiddleware, kpisController.getLateTaskRate);
router.get('/current-late-tasks', authMiddleware, kpisController.getCurrentLateTasks);
router.get('/avg-task-duration', authMiddleware, kpisController.getAvgTaskDuration);
router.get('/completed-tasks', authMiddleware, kpisController.getCompletedTasks);
router.get('/engineers-occupancy', authMiddleware, kpisController.getEngineersOccupancy);
router.get('/most-reliable-engineer', authMiddleware, kpisController.getMostReliableEngineer);
router.get('/client-satisfaction', authMiddleware, kpisController.getClientSatisfaction);
router.get('/delivery-conformity-rate', authMiddleware, kpisController.getDeliveryConformityRate);
router.get('/team-size', authMiddleware, kpisController.getAverageTeamSizePerProject);
router.get('/time-comparison', authMiddleware, kpisController.getTimeComparison); 
router.get('/workload', authMiddleware, kpisController.getWorkloadByEngineer); 
router.get('/engineer-turnover', authMiddleware, kpisController.getEngineerTurnover);
router.get('/risky-projects', authMiddleware, kpisController.getRiskyProjects); 
router.get('/files-per-project', authMiddleware, kpisController.getFilesPerProject);
router.get('/average-files-per-project', authMiddleware, kpisController.getAverageFilesPerProject);
router.get('/average-returns-per-project', authMiddleware, kpisController.getAverageReturnsPerProject);
router.get('/average-returns-per-client', authMiddleware, kpisController.getAverageReturnsPerClient);
router.get("/", authMiddleware, kpis2Controller.getKpis)

module.exports = router;