const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  creationDate:{
    type: Date,
    default: Date.now
  },
  finishDate:{
    type: Date
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  niveauEscalade: {
    type: String,
    enum: ['level1', 'level2','level3'],
    default :'level1'
  },
  RefTicketSupport: {
    type: String
  },
  status: {
    type: String,
    enum: [ 'Assigned','Resolved','Expired'],
    default: 'Assigned'
  },
  type: {
    type: String,
    enum: ['Externe', 'Interne'],
    default: 'Interne'
  },
  isFollowUp: {
    type: Boolean,
    default: 'false'
  },
  clientId: { type: mongoose.Schema.Types.ObjectId, required: true, ref:'Client' },
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
  siteId: { type: mongoose.Schema.Types.ObjectId, required: true , ref: 'Site' },
  equipmentSoftId: { type: mongoose.Schema.Types.ObjectId, ref: 'EquipmentSoft' },
  equipmentHardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
  technicienId: [{ type: mongoose.Schema.Types.ObjectId, ref:'Technicien' }],
  rapportId: [{ type: mongoose.Schema.Types.ObjectId, ref:'Rapport' }],
  followUpList: [{ type: mongoose.Schema.Types.ObjectId, ref:'FollowUp', default:null }],
  listOfFiles: [{ type: mongoose.Schema.Types.ObjectId, ref:'File' }],
});

const FollowUp = mongoose.model("FollowUp", followUpSchema);

module.exports = FollowUp;