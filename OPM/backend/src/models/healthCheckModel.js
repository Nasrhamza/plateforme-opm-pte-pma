const mongoose = require('mongoose');
const healthCheckSchema = new mongoose.Schema({
  designation: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true
  },
  SN: {
    type: String,
    required: true,
  },
  affectation: {
    type: String,
    required: true,
  },
  emplacement: {
    type: String,
    required: true,
  },
  adresseIP: {
    type: String,
    required: true,
  },
  resources: {
    type: String,
    required: true,
  },
  observation: {
    type: String,
    required: true,
  },

});

const HealthCheck = mongoose.model('HealthCheck', healthCheckSchema);
module.exports = HealthCheck;
