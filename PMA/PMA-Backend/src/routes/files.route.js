const express = require("express");
const router = express.Router();
const filesCtrl = require("../controllers/files.controller");
const { authMiddleware } = require("../middlewares/authMiddleware");

// ---------------------------- new routes ---------------------------
router.get("", authMiddleware, filesCtrl.findAll)
router.get("/:id", authMiddleware, filesCtrl.findById)
router.delete("/:id", authMiddleware, filesCtrl.delete)
// router.put("/:id", taskCtrl.update)

module.exports = router;