const express = require("express");
const router = express.Router();
const folderController = require('../controllers/folderController');
const upload = require('../middlewares/fileMiddleware');

// const upload = require('../middlewares/fileMiddleware');

router.get('/getAllFolders', folderController.getAllFolders);
router.get('/getListSiteBayFolder/:_id', folderController.getListSiteBayFolder);
router.get('/getContractsByFolderId/:_id', folderController.getContractsByFolderId);
router.get('/getFolderById/:_id', folderController.getFolderById);
router.put('/updateSite', folderController.updateSite);

router.post('/createFolder', upload.array('files'), folderController.createFolder);
router.put('/updateFolder',upload.array('files'), folderController.updateFolder);
router.post('/deleteFolder', folderController.deleteFolder);

module.exports = router; 