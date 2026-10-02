const express = require("express");
const router = express.Router();
const leaveCtr = require("../controllers/leaveController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { checkAdminMiddleware } = require("../middlewares/checkAdminMiddleware");

const { leaveStorageEngine } = require("../tools/FileStorageEngine");
const multer = require("multer");
const { checkAssistantAndAdminMiddleware } = require("../middlewares/checkAssistantAndAdminMiddleware");
const uploadCertLeave = multer({ storage: leaveStorageEngine });


router.post("/createLeaveRequest",authMiddleware,uploadCertLeave.single("certif"),leaveCtr.addRequest);
router.get("/getAllLeave",authMiddleware,checkAssistantAndAdminMiddleware,leaveCtr.getLeave);
router.get("/getUserLeave/:id",authMiddleware,leaveCtr.getUserLeave);
router.put("/managerAccept/:id",authMiddleware,checkAdminMiddleware,leaveCtr.managerAccept);
router.put("/workerAccept/:id",authMiddleware,leaveCtr.workerAccept);
router.put("/managerDecline/:id",authMiddleware,checkAdminMiddleware,leaveCtr.managerDecline);
router.put("/workerDecline/:id",authMiddleware,leaveCtr.workerDecline);

router.put("/getLeaveById/:id",authMiddleware,leaveCtr.getLeaveById);
router.put("/deleteLeave/:id",authMiddleware,leaveCtr.deleteLeave);
router.get("/getWorkerRequests/:id",authMiddleware,leaveCtr.getWorkerRequests);


// router.get("/getLeaveStat/:id")

module.exports = router;
