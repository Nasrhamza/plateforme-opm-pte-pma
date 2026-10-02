const express = require("express");
const router = express.Router();
const likeCtr = require("../controllers/likeController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { checkAdminMiddleware } = require("../middlewares/checkAdminMiddleware");

router.post("/:id",authMiddleware,likeCtr.like)
router.get("/:id",authMiddleware,likeCtr.getLike)
router.get("/getLikers/:id",authMiddleware,likeCtr.getLikers)
module.exports = router;
