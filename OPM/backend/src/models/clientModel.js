const mongoose = require('mongoose');
const User = require('./userModel')

const clientSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['clientManager','clientUser'],
    required: true
  },
  about: {
    type: String
  },

});
const Client = User.discriminator('Client', clientSchema);
module.exports = Client;