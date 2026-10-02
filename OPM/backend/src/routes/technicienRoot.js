const express = require("express");
const router = express.Router();
const technicianController = require('../controllers/technicianController');
const upload = require("../middlewares/fileMiddleware");

// user routes
router.get('/getTechnicianById/:id', technicianController.getTechnicianById);
router.get('/getAllEmployees', technicianController.getAllEmployees);
router.get('/getListTechnician', technicianController.getListTechnician);
router.get('/getListSupervisor', technicianController.getListSupervisor);
router.get('/getAllEmployeesByValid/:valid', technicianController.getAllEmployeesByValid);
router.get('/getAllEmployeesByContract/:id', technicianController.getAllEmployeesByContract);
router.put('/updateStatTech', technicianController.updateStatTech);
router.put('/updateTechnician/:id',upload.single('image'),  technicianController.updateTechnician);

// router.put('/changeStatCompClient', clientController.updateStatClient);

// router.get('/:username', userController.getUserByUsername);
// router.put('/:id', userController.updateStatClient);
// router.delete('/:username', userController.deleteUser);

module.exports = router;