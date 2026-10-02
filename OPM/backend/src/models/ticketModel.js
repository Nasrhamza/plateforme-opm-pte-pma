const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  creationDate: {
    type: Date,
    default: Date.now
  },
  number: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true
  },
  interventionAdress: {
    type: String,
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Not Assigned', 'Assigned', 'Resolved', 'In Progress', 'Deleted', 'Closed', 'On Hold'],
    default: 'Not Assigned'
  },
  isExpired: {
    type: Boolean,
    default: 'false'
  },
  isHelpdesk: {
    type: Boolean,
    default: 'false'
  },
  internalTask: {
    type: Boolean,
    default: 'false'
  },
  reminderSent: {
    type: Boolean,
    default: 'false'
  },

  resolvedDate: {
    type: Date
  },
  assignedDate: {
    type: Date
  },
  takenDate: {
    type: Date
  },
  closedDate: {
    type: Date
  },
  caseId: {
    type: String
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Chat'
  },
  exchanges: {
    type: mongoose.Schema.Types.ObjectId, ref: 'File'
  },
  solution: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Solution'
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Client'
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Contract'
  },
  siteId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Site'
  },
  equipmentSoftId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'EquipmentSoft'
  },
  equipmentHardId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Equipment'
  },
  technicienId: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Technicien'
  }],
  supervisor: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Technicien'
  },
  rapportId: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Rapport'
  }],
  listOfFiles: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'File'
  }],
  request: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Request'
  },

});

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;