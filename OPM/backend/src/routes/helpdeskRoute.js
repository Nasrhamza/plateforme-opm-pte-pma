const express = require("express");
const router = express.Router();
const helpdeskClientController = require("../controllers/helpdeskClientController");
const upload = require('../middlewares/fileMiddleware');

router.post('/createUser', upload.single('file'), helpdeskClientController.createUser);
router.put('/updateUser/:id', upload.single('file'), helpdeskClientController.updateUser);
router.get('/getListHelpdeskUser', helpdeskClientController.getListHelpdeskUser);




module.exports = router;
