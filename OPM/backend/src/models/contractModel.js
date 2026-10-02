const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: [
      'SUPPORT AND MAINTENANCE SOFT',
      'SUPPORT AND MAINTENANCE HARD',
      'INFOGERANCE',
      'SUPPORT AND MAINTENANCE SOFT AND HARD',
    ],
    required: true,
  },
  nature: {
    type: String,
    enum: [
      'DEVELOPMENT',
      'SYSTEME',
      'RESEAUX',
      'CYBER-SECURITY',
      'SUPPORT',
    ],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  sla: {
    type: String,
    required: true,
  },
  dueDate: {
    type: String,
  },
  jourInfogerance: {
    type: String,
    // validate: {
    //   validator: function (v) {
    //     return this.type === 'INFOGERANCE' ? !!v : true;
    //   },
    //   message: 'jourInfogerance is required when contract type is INFOGERANCE.',
    // },
  },
  valid: {
    type: Boolean,
    default: true,
  },
  technicians: [{
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technicien',
    },
    teamLeader: {
      type: Boolean,
      default: false,
    },
  }],
  commercial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commercial',
  },
  typeSupport: [{
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TypeSupport',
    },
    supportId: {
      type: String,
    },
  }],
  healthChecklist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthCheck',
  }],
  clients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  }],
  Vistepreventive: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vistepreventive',
  }],
  VisiteInfogerance: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VisiteInfogerance',
  }],
  listSite: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site'
  }],
  spares: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Spare'
  }],
  listOfFiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
  }],
});

// Pre-save hook to enforce additional validation
// contractSchema.pre('save', function (next) {
//   if (this.type === 'INFOGERANCE') {
//     if (!this.jourInfogerance) {
//       return next(
//         new Error('jourInfogerance is required for INFOGERANCE contracts.')
//       );
//     }
//     if (!this.VisiteInfogerance || this.VisiteInfogerance.length === 0) {
//       return next(
//         new Error(
//           'At least one VisiteInfogerance is required for INFOGERANCE contracts.'
//         )
//       );
//     }
//   }
//   next();
// });

// Create and export the model
const Contract = mongoose.model('Contract', contractSchema);
module.exports = Contract;
