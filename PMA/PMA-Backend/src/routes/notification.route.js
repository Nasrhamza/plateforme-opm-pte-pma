const express = require("express");
const router = express.Router();
const notificationCtrl = require("../controllers/notification.controller");
const { authMiddleware } = require("../middlewares/authMiddleware");

// ---------------------------- new routes ---------------------------
router.get("/users/:userId", authMiddleware, notificationCtrl.findByUser)
router.patch("/:id", authMiddleware, notificationCtrl.manageNotification)
router.delete("/:id", authMiddleware, notificationCtrl.deleteNotification)
router.get("/user/:userId/readAll", authMiddleware, notificationCtrl.realAllNotifications)
// router.put("/:id", taskCtrl.update)

module.exports = router;