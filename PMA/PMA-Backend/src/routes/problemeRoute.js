const express = require("express");
const router = express.Router();
const probCtr = require("../controllers/problemeController")
const { authMiddleware } = require("../middlewares/authMiddleware");

// --------------------- new routes ---------------------
router.get("",authMiddleware, probCtr.findAll);
router.delete("/:id",authMiddleware, probCtr.delete);
router.get("/:id",authMiddleware, probCtr.findById);
router.put("/:id",authMiddleware, probCtr.update);
router.post("",authMiddleware, probCtr.create);

module.exports = router;