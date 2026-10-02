const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require("../middlewares/fileMiddlewareAny");


router.get('/getUserById/:id', userController.getUserById);
router.get('/getListCommercial', userController.getListCommercial);
router.post('/changePassword/:id', userController.changePassword);
router.post('/createUser', userController.createUser);
router.put('/updateUser/:id', upload.single('image'), userController.updateUser);
router.put('/updateStatUser', userController.updateStatUser);


module.exports = router;