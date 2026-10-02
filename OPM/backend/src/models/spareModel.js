const mongoose = require('mongoose');

const spareSchema = new mongoose.Schema({
    serialNumber: {
        type: String,
    },
    equipmentName: {
        type: String,
        required: true
    },
    location: {
        type: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technicien'
    },
    status: {
        type: String,
        enum: ['Installed', 'Delivered', 'Stocked', 'Ordred'],
        required: true
    },
    typeSupport: {
        type: String,
        enum: ['HPE', 'Evernex'],
        required: true
    },
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    },
    deliveredAt: {
        type: Date
    },
    stockedAt: {
        type: Date
    },
    installedAt: {
        type: Date
    }
}, {
    timestamps: true
});

const Spare = mongoose.model('Spare', spareSchema);
module.exports = Spare;
