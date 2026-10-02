const mongoose = require('mongoose');

const helpdeskClientSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true,

    },
    location: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true,
    },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    },
}, {
    timestamps: true
}
);

const HelpdeskClient = mongoose.model('helpdeskClient', helpdeskClientSchema);

module.exports = HelpdeskClient;
