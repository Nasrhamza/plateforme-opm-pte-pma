const mongoose = require('mongoose');

const VistePreventiveSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In progress', 'Done'],
    default: 'Pending'
  },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  technicians: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Technicien' }],
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
  siteID: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  rapportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rapport' },
  contractID: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
});

const Vistepreventive = mongoose.model("Vistepreventive", VistePreventiveSchema);

module.exports = Vistepreventive;
