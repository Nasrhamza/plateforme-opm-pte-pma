const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  SN: {
    type: String,
    required: true,
    unique: true
  },
  nomPice: {
    type: String,
    required: true
  },
  valid: {
    type: Boolean,
    default: true
  },
  startDateContract: {
    type: Date,
    required: true
  },
  endDateContract: {
    type: Date,
    required: true
  },
  TypeSupport: [{
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TypeSupport',
      required: true
    },
    startDateSupport: {
      type: Date,
      required: true
    },
    endDateSupport: {
      type: Date,
      required: true
    },
    supportId: {
      type: String,
      required: true
    },
  }]
});

const Equipment = mongoose.model('Equipment', equipmentSchema);
module.exports = Equipment;
