const mongoose = require('mongoose');
const User = require('./userModel')

const helpdeskSchema = new mongoose.Schema({
    matricule: {
        type: String,
        required: true,
        unique: true
      },
    site: {
        type: String,
      },
    location: {
        type: String,
      },
    service: {
        type: String,
      },
    listEquipment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EquipmentHelpdesk'
    }],
 
});
const Helpdesk = User.discriminator('Helpdesk', helpdeskSchema);
module.exports = Helpdesk;