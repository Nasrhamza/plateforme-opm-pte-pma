const mongoose = require("mongoose");
const UserItemSchema = mongoose.Schema({

  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  equipment_type: { type: mongoose.Schema.Types.ObjectId, ref: "EquipmentType" },
  accessory_type: { type: mongoose.Schema.Types.ObjectId, ref: "AccessoryType" }
  
});

module.exports = mongoose.model("UserItem", UserItemSchema);
