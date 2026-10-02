const express = require("express");
const router = express.Router();
const vehicleCtr = require("../../controllers/material_resources/vehicleController");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const { checkAssistantMiddleware } = require("../../middlewares/chechAssistantMiddleware");

router.get("/getVehicles",authMiddleware,vehicleCtr.getAllVehicles);
router.get("/getVehicleById/:id",authMiddleware,vehicleCtr.getVehicleById);
router.post("/addVehicle",authMiddleware,checkAssistantMiddleware,vehicleCtr.addVehicle);

router.delete("/deleteVehicle/:id",authMiddleware,checkAssistantMiddleware,vehicleCtr.deleteVehicle);
router.put("/editVehicle/:id",authMiddleware,checkAssistantMiddleware,vehicleCtr.editVehicle);
router.patch("/changeAvailability/:id",authMiddleware,checkAssistantMiddleware,vehicleCtr.changeAvailability);
router.get("/search",  vehicleCtr.searchVehicle);
/**Events Managment ********/
//router.get("/events",  vehicleCtr.getVehicleEvents);
router.post("/setevent",authMiddleware,vehicleCtr.createEvent);
router.get("/getVehicleEvents/:id",authMiddleware,vehicleCtr.vehicleEventsById)
// router.patch("/acceptEvent/:id",  vehicleCtr.updateEvent);
router.delete("/deleteEvent/:id",  vehicleCtr.deleteEvent);
router.get("/getEventById/:id",authMiddleware,vehicleCtr.getEventById);
router.put("/updateEvent/:id",authMiddleware,vehicleCtr.editEvent)
router.delete("/deletEvent/:id",authMiddleware,vehicleCtr.deleteEvent)
router.get("/getAllEvents",vehicleCtr.getAllEvents)


router.post("/checkVehicleAvailability", vehicleCtr.checkVehicleAvailability);


router.get("/getVehicleCard/:id",authMiddleware,checkAssistantMiddleware, vehicleCtr.getVehicleCard);
router.post("/addVehicleCard",authMiddleware,checkAssistantMiddleware, vehicleCtr.addVehicleCard);
router.put("/updateVehicleCard/:id",authMiddleware,checkAssistantMiddleware, vehicleCtr.updateVehicleCard);
router.delete("/deleteVehicleCard",authMiddleware, checkAssistantMiddleware,vehicleCtr.deleteVehicleCard);
router.post("/addConsumption",authMiddleware,checkAssistantMiddleware, vehicleCtr.addConsumption);

module.exports = router;
