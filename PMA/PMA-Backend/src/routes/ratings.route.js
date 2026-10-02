const express = require("express");
const router = express.Router();
const ratingsController = require("../controllers/ratings.controller");
const { authMiddleware } = require("../middlewares/authMiddleware");

// ---------------------------- new routes ---------------------------
router.patch("/project/:id/leader", authMiddleware, ratingsController.managerEvaluateTeamLeader);
router.patch("/project/:id/member-note", authMiddleware, ratingsController.memberEvaluateTeamLeader);
router.get("/project/:id/overview", authMiddleware, ratingsController.getProjectRatingOverview);

module.exports = router;