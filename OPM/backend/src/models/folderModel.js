const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  creationDate: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  colorfoldr: {
    type: String,
    required: true
  },
  logo: {
    type: String,
  },
  contractId: [{
    type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Contract'
  }],

});

const Folder = mongoose.model("Folder", folderSchema);

module.exports = Folder; 