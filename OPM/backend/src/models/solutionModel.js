const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({

  creationDate: {
    type: Date,
    default: Date.now
  },
  solution: {
    type: String,
  },
  proposedPar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technicien',
  },
  valid: {
    type: Boolean,
    default: false
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'File'
  }],

});

const Solution = mongoose.model("Solution", solutionSchema);
module.exports = Solution;