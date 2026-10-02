const express = require('express');
const notificationController = require('../controllers/notificationController');
const router = express.Router();

router.get('/getUserNotifications/:id', notificationController.getUserNotifications);
router.post('/markAllAsRead', notificationController.markAllAsRead);
router.post('/markOneAsRead', notificationController.markOneAsRead);
router.delete('/clearAll/:userId', notificationController.clearAll);


module.exports = router;
