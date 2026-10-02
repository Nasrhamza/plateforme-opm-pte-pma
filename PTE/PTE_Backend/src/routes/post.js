const express = require("express");
const router = express.Router();
const postCtr = require("../controllers/postController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { checkAdminMiddleware } = require("../middlewares/checkAdminMiddleware");
const { postStorageEngine } = require("../tools/FileStorageEngine");
const multer = require("multer");
const uploadpostImages = multer({ storage: postStorageEngine });


router.post("/createPost",authMiddleware,uploadpostImages.array("images"),postCtr.addPost);
router.get("/getAllApprovedPosts",authMiddleware,postCtr.getAllApprovedPosts);
router.get("/getMyApprovedPosts/:id",authMiddleware,postCtr.getApprovedPosts);
router.get("/getMyDeclinedPosts/:id",authMiddleware,postCtr.getDeclinededPosts);
router.get("/getMyPendingPosts/:id",authMiddleware,postCtr.getPendingPosts);
router.get("/getPostById/:id",authMiddleware,postCtr.getPostById);
router.delete("/deletPost/:id",authMiddleware,postCtr.deletPost);
router.put("/updatePost/:id",authMiddleware,uploadpostImages.array("images"),postCtr.updatePost);
router.get("/getUserPosts/:id",authMiddleware,postCtr.getUserPosts);
router.put("/managerAccept/:id",authMiddleware,checkAdminMiddleware,postCtr.managerAccept);
router.put("/managerDecline/:id",authMiddleware,checkAdminMiddleware,postCtr.managerDecline);
router.patch("/savePost/:id",authMiddleware,postCtr.savePost);
router.get("/getUserSaved/:id",authMiddleware,postCtr.userSavedPosts);

router.get("/getAllPosts",authMiddleware,postCtr.getAll)

router.get("/postInteractionCount/:id",authMiddleware,postCtr.getPostInteractionCount)
router.get("/getAllStats",authMiddleware,postCtr.getAllStat)
// router.get("/getPostLikers/:id",authMiddleware,postCtr.getPostLikers)

module.exports = router;
