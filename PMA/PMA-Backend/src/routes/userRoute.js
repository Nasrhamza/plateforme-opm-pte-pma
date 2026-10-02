const express = require("express");
const router = express.Router();
const userCtr = require("../controllers/userController");
const projectCtr = require("../controllers/projectController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { imageStorage } = require("../tools/files_storage_engine");

// -------- new routes -----------
router.get("/", userCtr.findAll);
router.patch("/:id/profile", authMiddleware, userCtr.updateProfile);
router.put("/:id", authMiddleware, userCtr.updateUserDetails);
router.post("", authMiddleware, imageStorage.single("image"), userCtr.createUser);
router.patch("/:id/avatar", authMiddleware, imageStorage.single("image"), authMiddleware, userCtr.updateUserAvatar);
router.get("/:id", authMiddleware, userCtr.findById);
// router.delete("/:id", authMiddleware, userCtr.delete);
router.patch("/:id/password", authMiddleware, userCtr.updatePassword1);
router.get("/:id/clients", authMiddleware, projectCtr.findMyClients);
router.get("/leader/:id/clients", authMiddleware, projectCtr.findTeamLeaderClients);
router.get("/roles/overview", authMiddleware, userCtr.getUsersOverview);
router.patch("/:id/enable", authMiddleware, userCtr.enableUser);
router.patch("/:id/role", authMiddleware, userCtr.changeRole);

module.exports = router;
