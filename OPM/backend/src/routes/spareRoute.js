const express = require('express');
const router = express.Router();
const spareController = require('../controllers/spareController'); // Adjust path
const upload = require('../middlewares/fileMiddlewareAny');

// POST /api/spares
router.post('/createSpare', spareController.createSpare);
router.put('/updateSpareTicket/:id', upload.none(), spareController.updateSpareTicket);
router.put('/updateSpare/:id', spareController.updateSpare);
router.put('/deleteSpare', spareController.deleteSpare);
router.get('/getSparesByTicketId/:id', spareController.getSparesByTicketId);
router.get('/getAllSpare', spareController.getAllSpare);

module.exports = router;
