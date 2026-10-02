const mongoose = require('mongoose');

const rapportSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  number: {
    type: String,
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  path: {
    type: String,
  },
});

const Rapport = mongoose.model("Rapport", rapportSchema);

module.exports = Rapport;