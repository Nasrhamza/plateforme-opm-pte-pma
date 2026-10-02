const express = require("express");
const router = express.Router();
const SousTraitantCtr = require("../../controllers/material_resources/SousTraitant");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const {checkAdminMiddleware,} = require("../../middlewares/checkAdminMiddleware");
router.get("/getExternal",  SousTraitantCtr.getAllSousTraitant);
router.post("/addExternal",SousTraitantCtr.addSousTraitant);
router.delete("/deleteExternal/:id",SousTraitantCtr.deleteSousTraitant);
router.get("/search",  SousTraitantCtr.searchSousTraitant);
/**Events Managment ********/
router.get("/events",  SousTraitantCtr.getSousTraitantEvents);
router.post("/setevent",  SousTraitantCtr.createEvent);
router.patch("/acceptEvent/:id",  SousTraitantCtr.updateEvent);
router.delete("/deleteEvent/:id",  SousTraitantCtr.deleteEvent);

module.exports = router;
