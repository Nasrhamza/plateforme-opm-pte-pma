const express = require("express");
const router = express.Router();
const typesupportControllersoft = require('../controllers/typesupportController');
const upload = require('../middlewares/fileMiddleware');

router.get('/getAllTypeSupport', typesupportControllersoft.getAllTypeSupport);
router.get('/getAllTypeSupportforContract/:contractId', typesupportControllersoft.getAllTypeSupportforContract);
router.post('/createTypeSupport',upload.array('files'), typesupportControllersoft.createTypeSupport);
router.put('/updateTypeSupport', typesupportControllersoft.updateTypeSupport);
router.post('/deleteTypeSupport', typesupportControllersoft.deleteTypeSupport);
// getAllTypeSupport

module.exports = router; 