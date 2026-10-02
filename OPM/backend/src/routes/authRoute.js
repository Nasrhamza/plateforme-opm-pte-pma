const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const upload = require('../middlewares/fileMiddleware');

router.post('/register', upload.fields([
  { name: 'profilePicture', maxCount: 1 },       // For profile picture
  { name: 'signature', maxCount: 1 }    // For signature
]), authController.register);
router.post('/updateEtatUsers', authController.updateEtatUsers);
router.post('/requestPasswordReset', authController.requestPasswordReset);
router.post('/resetPassword', authController.resetPassword);
router.post('/login', authController.login);
router.delete('/logout', authController.logout);
// router.post('/email', authController.sendEmail);

module.exports = router;
