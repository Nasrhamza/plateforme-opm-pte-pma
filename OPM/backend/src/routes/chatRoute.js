const express = require('express');
const router = express.Router();
const upload = require("../middlewares/fileMiddlewareAny");
const chatController = require('../controllers/chatController');


router.post('/sendMessageToChat/:id', upload.array('files'), chatController.sendMessageToChat);
router.get('/getChatForTicket/:id', chatController.getChatForTicket);
router.delete('/deleteMessageFromChat/:messageId', chatController.deleteMessageFromChat);


module.exports = router;
