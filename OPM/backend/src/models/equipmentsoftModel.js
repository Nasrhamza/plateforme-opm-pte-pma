const mongoose = require('mongoose');

const equipmentsoftSchema = new mongoose.Schema({

    equipmentName: {
        type: String,
        required: true,
    },
    version: {
        type: String,
        required: true
    },
    constructure: {
        type: String,
        required: true
    },
    startDateContract: {
        type: Date,
        required: true
    },
    endDateContract: {
        type: Date,
        required: true
    },
    valid: {
        type: Boolean,
        default: true
    },
    TypeSupport: [{
        type: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TypeSupport',
            required: true
        },
        startDateSupport: {
            type: Date,
            required: true
        },
        endDateSupport: {
            type: Date,
            required: true
        },
        supportId: {
            type: String,
            required: true
        },
    }]


});

const EquipmentSoft = mongoose.model('EquipmentSoft', equipmentsoftSchema);
module.exports = EquipmentSoft;