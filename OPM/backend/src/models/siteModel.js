const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  nomSite: {
    type: String,
    required: true,
  },
  longitude: {
    type: String,
    //   required: true,
  },
  latitude: {
    type: String,
    //   required: true
  },
  adress: {
    type: String,
    required: true
  },
  listEquipment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' }],
  listEquipmentSoft: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EquipmentSoft' }],
});

const Site = mongoose.model('Site', siteSchema);
module.exports = Site;
