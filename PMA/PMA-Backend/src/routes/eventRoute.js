const express = require("express");
const router = express.Router();
const eventCtrl = require("../controllers/eventController");

const { authMiddleware } = require("../middlewares/authMiddleware");
// -------------- new routes --------------------------

router.get("", authMiddleware, eventCtrl.findAll);
router.post("", authMiddleware, eventCtrl.create);
router.put("/:id", authMiddleware, eventCtrl.update);
router.delete("/:id", authMiddleware, eventCtrl.delete);
router.get("/:id", authMiddleware, eventCtrl.findById);

module.exports = router;