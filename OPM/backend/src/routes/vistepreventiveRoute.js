const express = require("express");
const router = express.Router();
const vistepreventiveController = require('../controllers/vistepreventiveController');

router.get('/getlistvisiteprevForAdmin', vistepreventiveController.getAllVisite);
router.get('/getlistvisiteprevForClient/:id', vistepreventiveController.getAllVisiteClient);
router.get('/getlistvisiteprevForCommercial/:id', vistepreventiveController.getAllVisiteCommercial);
router.get('/getlistvisiteprevForTech/:id', vistepreventiveController.getAllVisiteTech);
router.get('/getOneVisitePrevBayId/:_id', vistepreventiveController.getOneVis);

module.exports = router;