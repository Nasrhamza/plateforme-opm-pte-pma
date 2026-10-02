const mongoose = require("mongoose");
const UserEventSchema = mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  engineer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  job: { type: String, required: true },
  address: { type: String, required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  caseNumber : {type: String},
  departure: { type: String, required: true },
  vehicleEvent:{ type: mongoose.Schema.Types.ObjectId, ref: "VehicleEvent" },
  isAccepted: { type: Boolean, required: true, default: true },
});
module.exports = mongoose.model("UserEvent", UserEventSchema);
