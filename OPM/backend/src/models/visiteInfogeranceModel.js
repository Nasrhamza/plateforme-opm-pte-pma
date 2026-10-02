const mongoose = require('mongoose');

const VisiteInfogeranceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In progress', 'Done'],
    default: 'Pending'
  },

  contractID: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },

});
const VisiteInfogerance = mongoose.model("VisiteInfogerance", VisiteInfogeranceSchema);
module.exports = VisiteInfogerance;
