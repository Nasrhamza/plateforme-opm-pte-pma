const Site = require('../models/siteModel');
const Folder = require('../models/folderModel');

exports.getSiteById = async (req, res) => {
  try {
    const site = await Site.findById(req.params.id)

      .populate({
        path: "listEquipment",
        populate: {
          path: "TypeSupport",
          populate: {
            path: "type",
          },
        },
      })
      .populate({
        path: "listEquipmentSoft",
        populate: {
          path: "TypeSupport",
          populate: {
            path: "type",
          },
        },
      })

    res.status(200).json({ err: false, message: "Successful operation!", rows: site });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
