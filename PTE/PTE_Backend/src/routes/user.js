const express = require("express");
const router = express.Router();
const userCtr = require("../controllers/userController");
const userEventCtr = require("../controllers/technical_team/userEventCtr");
const userPlanCtr = require("../controllers/technical_team/userPlanCtr");
const multer = require("multer");

const { authMiddleware } = require("../middlewares/authMiddleware");
const { checkAdminMiddleware } = require("../middlewares/checkAdminMiddleware");
const { fileStorageEngine } = require("../tools/FileStorageEngine");
const upload = multer({ storage: fileStorageEngine });
const { external_cv } = require("../tools/FileStorageEngine");
const { checkAssistantAndAdminMiddleware } = require("../middlewares/checkAssistantAndAdminMiddleware");
const upload_external_cv = multer({ storage: external_cv });
const { signature } = require("../tools/FileStorageEngine");

const signature_upload = multer({ storage: signature });
const { external_docs } = require("../tools/FileStorageEngine");

const external_doc = multer({ storage: external_docs });



router.post("/signup", upload.single("image"), userCtr.signUp);
//router.post("/adduser",userCtr.AddUser);
router.get("/signup/requests",authMiddleware,checkAdminMiddleware,userCtr.getSignUpRequests);
router.post("/confirm-signup/:id",authMiddleware,checkAdminMiddleware,userCtr.confirmSignUp);
router.put("/update/:id",authMiddleware,upload.single("image"),userCtr.UpdateUser);
router.patch("/updatePass/:id",authMiddleware,userCtr.updatePass);
router.patch("/update-roles/:id",authMiddleware,checkAdminMiddleware,userCtr.updateUserRoles);
router.post("/forgotPassword", userCtr.forgotPassword);  //1
router.post("/checkpass",  userCtr.checkPassword);
router.post("/addExternal",authMiddleware,checkAssistantAndAdminMiddleware,external_doc.array("external_docs"),userCtr.AddExternal)
router.post("/validateCode", userCtr.validateCode); //2
router.post("/changePswdAutorisation/:id", userCtr.changePswdAutorisation);
router.patch("/change-psw/:id", userCtr.changePswd); //3
router.get("/getall",authMiddleware, userCtr.getAllUsers);
router.get("/getAllTeamLeaders",authMiddleware, userCtr.getAllTeamLeaders);
router.get("/sousTraitant", userCtr.getAllUsers);
router.patch("/switchToExternal/:id",authMiddleware,checkAdminMiddleware, userCtr.switchToExternal)
router.delete("/delete/:id",authMiddleware,checkAdminMiddleware,userCtr.deleteUser);
router.get("/drivers",authMiddleware,userCtr.getDrivers);
router.get("/getUserByID/:id",authMiddleware,userCtr.getUserById);
router.post("/getUserByEmail/",userCtr.getUserByEmail);
router.patch("/uploadSignature/:id",authMiddleware,signature_upload.single("signature"), userCtr.uploadSignature)
router.get("/getAdmin",authMiddleware,userCtr.getAdmin)
/******************************************* */
/************ Event Managment ************** */
/******************************************* */
router.get("/events",authMiddleware,userEventCtr.getUserEvents);
router.get("/allUserEvents",authMiddleware,userEventCtr.getAllUsersEvents);
router.post("/setevent",authMiddleware,userEventCtr.createEvent );
// router.get("/Plan", authMiddleware, userPlanCtr.getUserPlans);
router.put("/updateEvent/:id",authMiddleware,userEventCtr.updateEvent);
router.delete("/deleteEvent/:id",authMiddleware,userEventCtr.deleteEvent);
router.get("/:id",authMiddleware,userCtr.getUserById);
router.get("/getPlanById/:id",  userPlanCtr.getPlanById);
router.post("/upload",upload.single("pdf"), userPlanCtr.uploadPlan);
router.get("/getTechEvents/:id",authMiddleware,  userCtr.techEventsById);
router.get("/getEventById/:id",authMiddleware, userCtr.getEventById);
router.post("/getEventsByDate",authMiddleware, userCtr.getEventsByDate);




module.exports = router;
