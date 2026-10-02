const express = require("express");
const router = express.Router();
const cvCtr = require("../controllers/cvController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { certStorageEngine } = require("../tools/FileStorageEngine");
const multer = require("multer");
const uploadCertFile = multer({ storage: certStorageEngine });


router.post("/addEdu",authMiddleware, cvCtr.addEducation);
router.post("/addExp",authMiddleware, cvCtr.addExperience);
router.post("/addCert",authMiddleware , uploadCertFile.single("cert_file"), cvCtr.addCertif);
router.post("/addSkill",authMiddleware, cvCtr.addSkill);
router.post("/addLanguage",authMiddleware, cvCtr.addLanguage);
router.post("/addProj",authMiddleware, cvCtr.addProject);


router.patch("/updateEdu/:id",authMiddleware, cvCtr.updateEducation);
router.patch("/updateExp/:id",authMiddleware, cvCtr.updateExperience);
router.patch("/updateCert/:id",authMiddleware, uploadCertFile.single("cert_file"), cvCtr.updateCertif);
router.patch("/updateSkill/:id",authMiddleware, cvCtr.updateSkill);
router.patch("/updateLanguage/:id",authMiddleware, cvCtr.updateLanguage);
router.patch("/updateProject/:id",authMiddleware, cvCtr.updateProject);
router.patch("/updateSummary/:id",authMiddleware, cvCtr.updateSummary);


router.get("/getEdu/:id",authMiddleware, cvCtr.getEducation);
router.get("/getExp/:id",authMiddleware, cvCtr.getExperience);
router.get("/getCertif/:id",authMiddleware, cvCtr.getCertif);
router.get("/getSkill/:id",authMiddleware, cvCtr.getSkill);
router.get("/getLanguage/:id",authMiddleware, cvCtr.getLanguage);
router.get("/getProject/:id",authMiddleware, cvCtr.getProject);
router.get("/getUserCV/:id",authMiddleware, cvCtr.getUserCV);
router.get("/getSummary/:id",authMiddleware, cvCtr.getSummary);


router.delete("/deleteEdu/:id",authMiddleware, cvCtr.deleteEducation);
router.delete("/deleteExp/:id",authMiddleware, cvCtr.deleteExperience);
router.delete("/deleteCert/:id",authMiddleware, cvCtr.deleteCertif);
router.delete("/deleteSkill/:id",authMiddleware, cvCtr.deleteSkill);
router.delete("/deleteLanguage/:id",authMiddleware, cvCtr.deleteLanguage);
router.delete("/deleteProject/:id",authMiddleware, cvCtr.deleteProject);


router.post("/filter",  cvCtr.filterCvs);
router.post("/search",  cvCtr.searchCvs);

module.exports = router;
