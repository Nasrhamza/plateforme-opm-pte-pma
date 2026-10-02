const express = require("express");
const router = express.Router();
const visteInfogeranceController = require('../controllers/visiteInfogeranceController');

router.get('/getlistvisiteInfogForAdmin', visteInfogeranceController.getAllVisite);
router.get('/getlistvisiteInfogForClient/:id', visteInfogeranceController.getAllVisiteClient);
router.get('/getlistvisiteInfogForCommercial/:id', visteInfogeranceController.getAllVisiteCommercial);
router.get('/getlistvisiteInfogForTech/:id', visteInfogeranceController.getAllVisiteTech);
router.get('/getOneVisiteInfogById/:_id', visteInfogeranceController.getOneVis);

module.exports = router;