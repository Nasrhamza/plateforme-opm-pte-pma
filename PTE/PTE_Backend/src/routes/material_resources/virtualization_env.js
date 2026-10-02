const express = require("express");
const router = express.Router();
const virtualizationEnvCtr = require("../../controllers/material_resources/virtualizationEnvController");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const { checkLabManagerMiddleware } = require("../../middlewares/checkLabManagerMiddleware");

router.get("/getVirtsEnv",authMiddleware,checkLabManagerMiddleware,virtualizationEnvCtr.getAllVirtsEnv);
router.post("/addaddVirtEnv",authMiddleware, virtualizationEnvCtr.addVirtEnv);
router.get("/getVirtEnv/:id",authMiddleware, virtualizationEnvCtr.getVirtEnvById);
router.delete("/deleteVirtEnv/:id",authMiddleware,checkLabManagerMiddleware, virtualizationEnvCtr.deleteVirtEnv);
router.put("/accpectReq/:id",authMiddleware,checkLabManagerMiddleware,virtualizationEnvCtr.acceptLabRequest);
router.put("/declineReq/:id",authMiddleware,checkLabManagerMiddleware,virtualizationEnvCtr.declineLabRequest);
router.get("/getUserLabEnv/:id",authMiddleware,virtualizationEnvCtr.getUserLabEnv);
router.get("/allActiveLabs",virtualizationEnvCtr.getActiveLabs)
module.exports = router;
