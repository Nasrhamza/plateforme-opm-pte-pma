const express = require("express");
const router = express.Router();
const procesvCtrl = require("../controllers/procesController");
const { authMiddleware } = require("../middlewares/authMiddleware");

// ---------------------------- new routes ---------------------------
router.get("", authMiddleware, procesvCtrl.findAll)
router.post("", authMiddleware, procesvCtrl.create)
router.get("/:id", authMiddleware, procesvCtrl.findById)
router.delete("/:id", authMiddleware, procesvCtrl.delete)
router.put("/:id", authMiddleware, procesvCtrl.update)



module.exports = router;