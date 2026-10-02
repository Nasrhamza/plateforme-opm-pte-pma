const mongoose = require("mongoose");
const vehicle = require("./vehicle");
const GasCardSchema = mongoose.Schema({
  card_number: { type: String, required: true },
  balance: { type: String, required: true },
  vehicle: {type:mongoose.Schema.Types.ObjectId, ref : "Vehicle" },
  consumption: [{
    date: { type: Date, required: true },
    amount: { type: Number, required: true }
  }]
});
module.exports = mongoose.model("GasCard", GasCardSchema);
