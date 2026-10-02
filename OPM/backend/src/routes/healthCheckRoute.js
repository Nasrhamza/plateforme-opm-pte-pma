const express = require("express");
const router = express.Router();
const healthCheckController = require('../controllers/healthCheckController');


router.post('/createHealhCheck', healthCheckController.createHealhCheck);
// router.post('/createImportinEquipmentHared', healthCheckController.createImportinEquipmentHared);
router.put('/updateHealthCheck', healthCheckController.updateHealthCheck);
router.post('/deleteHealthCheck', healthCheckController.deleteHealthCheck);
router.get('/getHealthCheckByContract/:_id', healthCheckController.getHealthCheckByContract);

module.exports = router; 