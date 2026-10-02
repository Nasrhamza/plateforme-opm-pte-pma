const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({

  description: {
    type: String,
    required: true
  },

  valid: {
    type: Boolean,
    default: false
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technicien'
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  },
},
  {
    timestamps: true
  });

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;