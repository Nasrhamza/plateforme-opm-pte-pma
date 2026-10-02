const express = require("express");
const router = express.Router();
const equipmentHelpdeskController = require('../controllers/equipmentHelpdeskController');


router.post('/createEquipmentHelpdesk', equipmentHelpdeskController.createEquipmentHelpdesk);
router.post('/assignEquipmentUser', equipmentHelpdeskController.assignEquipmentUser);
router.get('/getAllEquipment', equipmentHelpdeskController.getAllEquipment);
router.post('/updateEquipmentHelpdesk', equipmentHelpdeskController.updateEquipmentHelpdesk);
router.delete('/deleteEquipmentHelpdesk/:_id', equipmentHelpdeskController.deleteEquipmentHelpdesk);
router.post('/deleteEquipmentUser', equipmentHelpdeskController.deleteEquipmentUser);


module.exports = router; 