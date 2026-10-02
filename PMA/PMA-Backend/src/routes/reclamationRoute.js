const express = require("express");
const router = express.Router();
const reclamationCtrl = require('../controllers/reclamationController')
const { authMiddleware } = require("../middlewares/authMiddleware");
/*=======================POST=============================== */

// --------------------- new routes ---------------------------------------
router.get("", authMiddleware, reclamationCtrl.findAll)
router.get("/:id", authMiddleware, reclamationCtrl.findById)
router.delete("/:id", authMiddleware, reclamationCtrl.delete)
router.put("/:id", authMiddleware, reclamationCtrl.update)
router.patch("/:id/response", authMiddleware, reclamationCtrl.addResponse)
router.get("/leader/:userId", authMiddleware, reclamationCtrl.findByTeamLeader)
router.get("/client/:id", authMiddleware, reclamationCtrl.findClientReclamations)
router.get("/overview/get", authMiddleware, reclamationCtrl.findReclamationsOverview)
router.get("/project/:id", authMiddleware, reclamationCtrl.findByProject)
router.post("", authMiddleware, reclamationCtrl.create)


module.exports = router;