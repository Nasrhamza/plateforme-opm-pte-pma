const express = require("express");
const router = express.Router();
const clientController = require('../controllers/clientController');
const upload = require("../middlewares/fileMiddleware");


// user routes
router.get('/getListContractByClient/:_id', clientController.getListContractByClient);
router.get('/getListContractByTechnician/:_id', clientController.getListContractByTechnician);
router.get('/getListClient', clientController.getAllClients);
router.get('/getClientById/:id', clientController.getClientById);
router.get('/getListClientOldNotAffected/:companyName', clientController.getListClientOldNotAffected);
router.get('/getListClientDejaAffected/:_id', clientController.getListClientDejaAffected);
router.put('/changeStatCompClient', clientController.updateStatClient);
router.put('/updateClient/:id', upload.single('image'), clientController.updateClient);
router.post('/affectOledCustemer', clientController.affectOledCustemer);

module.exports = router;