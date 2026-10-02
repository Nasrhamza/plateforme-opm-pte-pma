const express = require("express");
const router = express.Router();
const siteController = require('../controllers/siteController');

router.get('/getSiteById/:id', siteController.getSiteById);

module.exports = router; 