const mongoose = require('mongoose');

const typesupportSchema = new mongoose.Schema({
    supportName: {
        type: String,
        required: true,
    },
    supportEmail: {
        type: String,
        required: true,
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    logo: {
         type: mongoose.Schema.Types.ObjectId, ref: 'File'
        },
});

const TypeSupport = mongoose.model('TypeSupport', typesupportSchema);
module.exports = TypeSupport;
