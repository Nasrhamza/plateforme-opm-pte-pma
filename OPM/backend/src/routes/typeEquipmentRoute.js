const express = require("express");
const router = express.Router();
const typeEquipmentController = require('../controllers/typeEquipmentController');
const upload = require('../middlewares/fileMiddleware');

router.get('/getAllTypeEquipment', typeEquipmentController.getAllTypeEquipment);
router.post('/createTypeEquipment',upload.array('files'), typeEquipmentController.createTypeEquipment);
router.put('/updateTypeEquipment', typeEquipmentController.updateTypeEquipment);
router.post('/deleteTypeEquipment', typeEquipmentController.deleteTypeEquipment);

module.exports = router; 