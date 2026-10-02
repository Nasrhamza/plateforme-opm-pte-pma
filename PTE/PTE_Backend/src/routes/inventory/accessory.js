const express = require("express");
const router = express.Router();
const accessoryCtr = require("../../controllers/inventory/accessoryController");


router.post("/",accessoryCtr.addAccessory);
router.get("/",accessoryCtr.getAllAccessories);
router.get("/:id",accessoryCtr.getAccessoryById);
router.get("/getUserAccessories/:id",accessoryCtr.getUserAccessories);
router.delete("/:id",accessoryCtr.deleteAccessory);
router.patch("/:id",accessoryCtr.forwardAccessory);
router.put("/:id",accessoryCtr.editAccessory);

module.exports = router;
