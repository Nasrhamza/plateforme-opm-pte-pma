const express = require("express");
const router = express.Router();
const taskCtrl = require("../controllers/taskController");
const { authMiddleware } = require("../middlewares/authMiddleware");

// ---------------------------- new routes ---------------------------
router.get("", authMiddleware, taskCtrl.findAll);
router.post("", authMiddleware, taskCtrl.create);
//this task must not have an auth middleware cause it is being consummed via PTE, 
// including authMiddleware may cause error in PTE
router.post("/getTasksByUser", taskCtrl.findTaskByRefAndUser);
router.get("/:id", authMiddleware, taskCtrl.findById);
router.delete("/:id", authMiddleware, taskCtrl.delete);
router.put("/:id", authMiddleware, taskCtrl.update);
router.get("/engineer/:userId", authMiddleware, taskCtrl.findEngineerTasks);
router.get("/leader/:userId", authMiddleware, taskCtrl.findByTeamLeader);
router.patch("/:id/progress", authMiddleware, taskCtrl.changeTaskProgress);
router.patch("/:id/rating/weight", authMiddleware, taskCtrl.defineTaskRatingWeight);
router.patch("/:id/rating/note", authMiddleware, taskCtrl.evaluateTask);

module.exports = router;