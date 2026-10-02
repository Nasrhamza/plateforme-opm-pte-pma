const mongoose = require('mongoose');
const User = require('./userModel')
const technicienSchema = new mongoose.Schema({

  permisConduire: {
    type: Boolean,
    required: false,
    default: false
  },
  passeport: {
    type: Boolean,
    required: false,
    default: false
  },
  birthDate: {
    type: Date,
  },
  expiredAt: {
    type: Date,
  },
  signature: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  },

});
const Technicien = User.discriminator('Technicien', technicienSchema);
module.exports = Technicien;
