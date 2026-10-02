const express = require("express");
const router = express.Router();
const roomCtr = require("../../controllers/material_resources/roomController");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const { checkAssistantMiddleware } = require("../../middlewares/chechAssistantMiddleware");

router.get("/getRooms",authMiddleware,roomCtr.getAllRooms);
router.get("/search",  roomCtr.searchRoom);
router.post("/add",authMiddleware,checkAssistantMiddleware,roomCtr.addRoom);
router.put("/editRoom/:id",authMiddleware,checkAssistantMiddleware,roomCtr.editRoom);
router.delete("/delete/:id",authMiddleware,checkAssistantMiddleware,roomCtr.deleteRoom);
/**Events Managment ********/
router.get("/getRoomEvents/:id",authMiddleware,roomCtr.roomEventsById);
router.post("/setevent",authMiddleware,roomCtr.createEvent);
router.put("/updateEvent/:id",authMiddleware,roomCtr.updateEvent);
router.delete("/deleteEvent/:id",  roomCtr.deleteEvent);
router.get("/getEventById/:id",authMiddleware,roomCtr.getEventById);
router.get("/getAllEvents",roomCtr.getAllEvents)
router.get("/tablette/getRoomEvents/:id",roomCtr.roomEventsById);

router.get("/tablette/getRoomEvents/:id",roomCtr.tabRoomEvents)
router.get("/tablette/getAllRooms",roomCtr.tabletteAllRooms)

module.exports = router;

