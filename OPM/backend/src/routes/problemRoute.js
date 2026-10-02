const express = require("express");
const router = express.Router();
const problemController = require('../controllers/problemController');


router.post('/createProblem', problemController.createProblem);
router.put('/updateProblem', problemController.updateProblem);
router.post('/deleteProblem', problemController.deleteProblem);
router.get('/getAllProblems', problemController.getAllProblems);

module.exports = router; 