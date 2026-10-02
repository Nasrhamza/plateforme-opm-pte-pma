const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  nomProblem: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },

});

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;
