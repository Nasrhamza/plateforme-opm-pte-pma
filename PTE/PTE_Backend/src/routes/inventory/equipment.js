const express = require("express");
const router = express.Router();
const equipmentCtr = require("../../controllers/inventory/equipmentController");


router.post("/",equipmentCtr.addEquipment);
router.get("/",equipmentCtr.getAllEquipments);
router.get("/:id",equipmentCtr.getEquipmentById);
router.get("/getUserEquipments/:id",equipmentCtr.getUserEquipments);
router.delete("/:id",equipmentCtr.deleteEquipment);
router.patch("/:id",equipmentCtr.forwardEquipment);
router.put("/:id",equipmentCtr.editEquipment);


router.get("/downloadUserItems/:id",equipmentCtr.downloadUserItems)
// router.post("/downloadUserItems2",equipmentCtr.downloadUserItems2)
router.post("/downloadAllItems",equipmentCtr.downloadAllItems)

module.exports = router;
