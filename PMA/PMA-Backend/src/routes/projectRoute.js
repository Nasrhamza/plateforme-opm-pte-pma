const express = require("express");
const router = express.Router();
const projectCtrl = require("../controllers/projectController");
const { fileStorage } = require("../tools/files_storage_engine");
const { authMiddleware } = require("../middlewares/authMiddleware");

//-------------------- new routes ------------------------
router.post('', authMiddleware, projectCtrl.createProject);
router.get('/myteam', authMiddleware, projectCtrl.getMyTeams);
router.post('/generate', authMiddleware, projectCtrl.generateProjectFromText);
router.patch('/:id/note', authMiddleware, projectCtrl.noteProject);
router.get('', authMiddleware, projectCtrl.findAll);
router.get('/status', authMiddleware, projectCtrl.findProjectsGroupedByStatus);
router.get('/:id', authMiddleware, projectCtrl.findById);
router.get('/:id/uploads', authMiddleware, projectCtrl.findProjectUploads);
router.get('/client/:id', authMiddleware, projectCtrl.findClientProjects);
router.put('/:id', authMiddleware, projectCtrl.updateProjectNew);
router.post('/shareFile', authMiddleware, projectCtrl.shareFile);
router.delete('/:id/files', authMiddleware, projectCtrl.deleteFile);
router.patch("/:id/files", authMiddleware, fileStorage.single("file"), projectCtrl.uploadFile);
router.patch("/:id/files1", authMiddleware, fileStorage.array("file"), projectCtrl.uploadMultipleFile);
router.get('/leaders/participations', authMiddleware, projectCtrl.findTeamLeadersParticipations);
router.get('/engineer/participations', authMiddleware, projectCtrl.findEngineersParticipations);
router.patch('/:id/rating/files', authMiddleware, projectCtrl.configureFilesRatingConfig);
router.get('/:id/equipe', authMiddleware, projectCtrl.findEquipeByProject);
router.get('/compare/current-last-year', authMiddleware, projectCtrl.getProjectForCurrentAndLastYear);

module.exports = router;