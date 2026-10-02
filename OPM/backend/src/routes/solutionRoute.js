const express = require("express");
const upload = require('../middlewares/fileMiddlewareAny');
const router = express.Router();
const solutionController = require('../controllers/solutionController');

router.get('/getAllRequests', solutionController.getAllRequests);
router.get('/get3TopTechnicians', solutionController.get3TopTechnicians);
router.get('/get3TopOnHoldTechnicians', solutionController.get3TopTechniciansOnHold);
router.post('/requestSolution', upload.array('files'), solutionController.requestSolution);
router.post('/validateRequest', solutionController.validateRequest);


module.exports = router; 