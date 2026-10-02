const express = require("express");
const router = express.Router();
const userEventCtr = require("../../controllers/technical_team/userEventCtr");
const { authMiddleware } = require("../../middlewares/authMiddleware");

router.get("/getAllUserEvents", authMiddleware, userEventCtr.getAllUsersEvents);
router.get("/getUserEvents", authMiddleware, userEventCtr.getUserEvents);
router.post("/createEvent", authMiddleware, userEventCtr.createEvent);
router.put("/updateEvent/:id", authMiddleware, userEventCtr.updateEvent);
router.delete("/deleteEvent/:id", authMiddleware, userEventCtr.deleteEvent);

module.exports = router;
