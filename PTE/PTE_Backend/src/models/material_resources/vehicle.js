const mongoose = require("mongoose");
const VehicleSchema = mongoose.Schema({
  model: { type: String, required: true },
  registration_number: { type: String, required: true },
  type: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  log: [{
    event: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleEvent" },
    kilometrage : { type: Number, default: 0 },
    reservationDate: { type: Date , default : Date.now()},
  }],
  kmTotal : { type: Number, default: 0 },
  available : {type : Boolean, default : true}
});
module.exports = mongoose.model("Vehicle", VehicleSchema);
