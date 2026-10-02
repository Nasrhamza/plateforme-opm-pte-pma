const express = require("express");
const router = express.Router();
const commentCtr = require("../controllers/commentController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { checkAdminMiddleware } = require("../middlewares/checkAdminMiddleware");

router.post("/:id/addComment",authMiddleware,commentCtr.addComment);
router.get("/:id/getPostComments",authMiddleware,commentCtr.getPostComments);
router.get("/:id/getCommentById/:id",authMiddleware,commentCtr.getCommentById);
router.delete("/:id/:comment_id",authMiddleware,commentCtr.deletComment);
router.put("/:comment_id",authMiddleware,commentCtr.updateComment);

module.exports = router;
