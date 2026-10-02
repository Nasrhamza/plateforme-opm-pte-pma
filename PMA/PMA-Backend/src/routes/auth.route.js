const express = require('express');
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { imageStorage } = require('../tools/files_storage_engine');

router.post("/login", authController.login);
router.post("/signup", imageStorage.single("image"),authController.signUp);
router.post("/forgot-password", authController.forgotPassword);
router.post("/validateCode", authController.validateCode);
router.post("/reset-password", authController.resetPassword);

module.exports = router;