const mongoose = require("mongoose");
const EquipmentTypeSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  name : {type : String, required: true},
  brand:{type:String , required: true},
  model:{type:String , required: true},
  serial_number:{type:String},
});

module.exports = mongoose.model("EquipmentType", EquipmentTypeSchema);
