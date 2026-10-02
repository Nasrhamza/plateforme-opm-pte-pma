const mongoose = require("mongoose");
const AccessoryTypeSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  name : {type : String, required: true},
  brand:{type:String },
  model:{type:String },
  serial_number:{type:String},
});

module.exports = mongoose.model("AccessoryType", AccessoryTypeSchema);
