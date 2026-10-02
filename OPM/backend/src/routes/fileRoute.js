const express = require("express");
const router = express.Router();
const fileController = require('../controllers/fileController');

// // file routes
// router.post('/createFile', fileController.createFile);
// router.get('/all', fileController.getAllFiles);
router.get('/:id', fileController.getFileById);
router.get('/downloadFile/:id', fileController.downloadFile);
// router.put('/updateFile', fileController.updateFile);
router.post('/deleteFile', fileController.deleteFile);

module.exports = router;