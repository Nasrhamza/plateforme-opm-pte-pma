const mongoose = require('mongoose');
const User = require('./userModel')

const commercialSchema = new mongoose.Schema({

    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract'},

});
const Commercial = User.discriminator('Commercial', commercialSchema);
module.exports = Commercial;