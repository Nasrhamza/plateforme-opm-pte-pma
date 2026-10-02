const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();
const upload = require("../middlewares/fileMiddleware");

// Routes
router.post('/createAdmin', adminController.createAdmin);
router.get('/getAllAdmins', adminController.getAllAdmins);
router.get('/getAdminById/:id', adminController.getAdminById);
router.put('/updateAdmin/:id', upload.single('image'),adminController.updateAdmin);
router.delete('/deleteAdmin/:id', adminController.deleteAdmin);

module.exports = router;
