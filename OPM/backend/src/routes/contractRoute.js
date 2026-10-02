const express = require("express");
const router = express.Router();
const contractController = require('../controllers/contractController');
const upload = require('../middlewares/fileMiddleware');

router.post('/createContract', contractController.createContract);
router.get('/getContractById/:id', contractController.getContractById);
router.get('/getContractByClient/:id', contractController.getContractByClient);
router.get('/getContractFilesByClient/:id', contractController.getContractFilesByClient);
router.get('/getAllContracts', contractController.getAllContracts);
router.post('/addTechnician', contractController.addTechnician);
router.post('/addCommercial', contractController.addCommercial);
router.post('/addClient', contractController.addClient);
router.post('/addOnePlanificationVistePreventive', contractController.AddOnePlanificationVistePreventive);
router.post('/deleteVisitePrev', contractController.deleteVisitePrev);
router.post('/updateVisitePrev', contractController.updateVisitePrev);
router.post('/addlistFileContract', upload.fields([
  { name: 'contratSigneFiles', maxCount: 10 },
  { name: 'matriceDescaladeFiles', maxCount: 10 },
  { name: 'autreFiles', maxCount: 10 }
]), contractController.addFileToContract);
router.put('/updateContract', contractController.updateContract);
router.put('/shareFile', contractController.shareFile);
router.post('/deleteContract', contractController.deleteContract);
router.post('/deleteUserfromContract', contractController.deleteUserfromContract);
router.post('/deleteVisaAvisContract', contractController.deleteVisaAvisContract);
router.put('/updateCustomers', contractController.updateCustomers);
router.post('/deleteResponsableEquipeContract', contractController.deleteResponsableEquipeContract);
router.post('/deleteMemberEquipefromContract', contractController.deleteMemberEquipefromContract);
router.get('/getListEquipeContract/:_id', contractController.getListEquipeContract);
router.get('/getListEquipmentByContract/:_id', contractController.getListEquipmentByContract);
router.post('/getListEquipmentByMultipleContract', contractController.getListEquipmentByMultipleContract);
router.post('/addSite', contractController.addSiteForContract);
router.post('/deleteSite', contractController.deleteSite);


module.exports = router;
