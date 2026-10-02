const express = require("express");
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');


router.post('/createEquipment', equipmentController.createEquipment);
router.post('/createImportinEquipmentHared', equipmentController.createImportinEquipmentHared);
router.post('/updateEquipment', equipmentController.updateEquipment);
router.post('/deleteEquipment', equipmentController.deleteEquipment);
// 

module.exports = router; 