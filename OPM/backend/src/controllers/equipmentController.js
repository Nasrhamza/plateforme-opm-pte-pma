const Equipment = require('../models/equipmentModel');
const Site = require('../models/siteModel');
const User = require('../models/userModel');
const TypeSupport = require('../models/typeSupportModel');
const { default: mongoose } = require('mongoose');
const Contract = require('../models/contractModel');

exports.createEquipment = async (req, res) => {
  try {
    const siteId = req.body.siteId;
    const contractId = req.body.contractId;
    const contract = await Contract.findById(contractId);

    if (!contract) {
      return res.status(404).json({ err: true, message: "Contract not found" });
    }

    const startDateContract = contract.startDate;
    const { nomPice, SN, endDateContract, TypeSupport1, TypeSupport2, startDateSupport1, endDateSupport1, startDateSupport2, endDateSupport2 } = req.body.data;
    const typeSupports = contract.typeSupport || [];

    const getSupportId = (typeId) => {
      const support = typeSupports.find(ts => ts.type.toString() === typeId);
      return support ? support.supportId : null;
    };
    const support1Id = getSupportId(TypeSupport1);
    const support2Id = TypeSupport2 ? getSupportId(TypeSupport2) : null;

    if (!support1Id) {
      return res.status(400).json({ err: true, message: "TypeSupport1 is invalid or missing supportId in contract" });
    }

    const equipmentData = {
      SN,
      nomPice,
      valid: true,
      startDateContract,
      endDateContract,
      TypeSupport: [
        {
          type: new mongoose.Types.ObjectId(TypeSupport1),
          startDateSupport: new Date(startDateSupport1),
          endDateSupport: new Date(endDateSupport1),
          supportId: support1Id
        }
      ]
    };

    if (TypeSupport2 && support2Id) {
      equipmentData.TypeSupport.push({
        type: new mongoose.Types.ObjectId(TypeSupport2),
        startDateSupport: new Date(startDateSupport2),
        endDateSupport: new Date(endDateSupport2),
        supportId: support2Id
      });
    }

    const equipment = new Equipment(equipmentData);
    await equipment.save();
    const equipmentId = equipment._id.toString();

    const updatedSite = await Site.findByIdAndUpdate(
      siteId,
      { $push: { listEquipment: equipmentId } },
      { new: true }
    ).populate({
      path: "listEquipment",
      populate: {
        path: "TypeSupport",
        populate: { path: "type" }
      }
    });

    res.status(200).json({ err: false, message: "Equipment created successfully!", data: updatedSite });

  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    const contractId = req.body.contractId;
    const { _id, SN, nomPice, TypeSupport1, TypeSupport2, startDateSupport1, endDateContract, endDateSupport1, startDateSupport2, endDateSupport2 } = req.body;

    // Fetch the existing equipment
    const existingEquipment = await Equipment.findById(_id).populate('TypeSupport');
    if (!existingEquipment) {
      return res.status(404).json({ err: true, message: "Equipment not found!" });
    }

    // Get the contract's TypeSupport array (just as in create)
    const contract = await Contract.findById(contractId);
    const typeSupports = contract.typeSupport || [];

    const getSupportId = (typeId) => {
      const support = typeSupports.find(ts => ts.type.toString() === typeId);
      return support ? support.supportId : null;
    };

    // Fetch support IDs based on provided TypeSupport types
    const support1Id = getSupportId(TypeSupport1);
    const support2Id = TypeSupport2 ? getSupportId(TypeSupport2) : null;

    if (!support1Id) {
      return res.status(400).json({ err: true, message: "Invalid or missing supportId for TypeSupport1" });
    }

    // Build the new TypeSupport array to fully replace the old one
    const updatedTypeSupport = [
      {
        type: new mongoose.Types.ObjectId(TypeSupport1),
        startDateSupport: new Date(startDateSupport1),
        endDateSupport: new Date(endDateSupport1),
        supportId: support1Id
      }
    ];

    // If there's a second support, add it
    if (TypeSupport2 && support2Id) {
      updatedTypeSupport.push({
        type: new mongoose.Types.ObjectId(TypeSupport2),
        startDateSupport: new Date(startDateSupport2),
        endDateSupport: new Date(endDateSupport2),
        supportId: support2Id
      });
    }

    const updateData = {
      SN,
      nomPice,
      endDateContract: new Date(endDateContract), // Directly convert it to Date
      TypeSupport: updatedTypeSupport
    };


    // Update the equipment
    const updatedEquipment = await Equipment.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    ).populate({
      path: "TypeSupport",
      populate: {
        path: "type" // This will populate the `type` field within each item in the `TypeSupport` array
      }
    });

    if (!updatedEquipment) {
      return res.status(404).json({ err: true, message: "Equipment update failed!" });
    }

    // Return the updated equipment data
    res.status(200).json({ err: false, message: "Equipment updated successfully!", rows: updatedEquipment });

  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.body._id);
    if (!equipment) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    const siteId = req.body.siteId;
    await Site.findOneAndUpdate(
      { _id: siteId }, // Assuming the contract document has a folderID field
      { $pull: { listEquipment: req.body._id } },
      { new: true }
    );
    res.status(200).json({ err: false, message: "Successful operation !", rows: equipment });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.createImportinEquipmentHared = async (req, res) => {
  try {
    const _id = req.body._id;
    const listEquipe = req.body.equipmentsList

    let ListAddetEquipment = []
    for (let index = 0; index < listEquipe.length; index++) {
      let typeSupport = await TypeSupport.findOne({ supportName: listEquipe[index].TypeSupport });
      let val = true;
      if (listEquipe[index].valid == 'Active') {
        val = true
      } else {
        val = false
      }
      let equipmentData = Equipment({
        nomPice: listEquipe[index].nomPice,
        SN: listEquipe[index].SN,
        TypeSupport: typeSupport._id.toString(),
        startDateSupport: listEquipe[index].startDateSupport,
        endDateSupport: listEquipe[index].endDateSupport,
      })

      await equipmentData.save()
      ListAddetEquipment.push(equipmentData)
    }
    const updateSite = await Site.findOneAndUpdate(
      { _id },
      { $push: { listEquipment: ListAddetEquipment } },
      { new: true }
    ).populate({
      path: 'listEquipment',
      populate: {
        path: 'TypeSupport', // Adjust this if there are nested fields to populate
        model: 'TypeSupport'
      }
    })
    res.status(200).json({ err: false, message: "Successful operation !", rows: updateSite });

  } catch (error) {
    console.log(error)
    res.status(500).json({ err: true, message: error.message });
  }
};


