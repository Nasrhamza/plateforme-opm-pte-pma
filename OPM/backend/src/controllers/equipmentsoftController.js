const { default: mongoose } = require('mongoose');
const Contract = require('../models/contractModel');
const EquipmentSoft = require('../models/equipmentsoftModel');
const Site = require('../models/siteModel');
const TypeSupport = require('../models/typeSupportModel');

//create contract
exports.createEquipmentSoft = async (req, res) => {
  try {
    const _id = req.body.siteId;
    const contractId = req.body.contractId;
    const contract = await Contract.findById(contractId);

    if (!contract) {
      return res.status(404).json({ err: true, message: "Contract not found" });
    }
    const startDateContract = contract.startDate;
    const { equipmentName, constructure, version, endDateContract, TypeSupport1, TypeSupport2, startDateSupport1, endDateSupport1, startDateSupport2, endDateSupport2 } = req.body.data;
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
      equipmentName,
      constructure,
      version,
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
    const equipementSoft = EquipmentSoft(equipmentData);
    await equipementSoft.save();
    const equipementSoftId = equipementSoft._id.toString();

    const updateSite = await Site.findByIdAndUpdate(
      { _id },
      { $push: { listEquipmentSoft: equipementSoftId } },
      { new: true }
    ).populate({
      path: "listEquipmentSoft",
      populate: {
        path: "TypeSupport",
        populate: { path: "type" }
      }
    });

    res.status(200).json({ err: false, message: "Successful operation !", rows: updateSite });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.updateEquipmentSoft = async (req, res) => {

  const contractId = req.body.contractId;
  const { _id, equipmentName, version, constructure, TypeSupport1, TypeSupport2, startDateSupport1, endDateContract, endDateSupport1, startDateSupport2, endDateSupport2 } = req.body;
  try {
    const existingEquipment = await EquipmentSoft.findById(_id).populate('TypeSupport');
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
      equipmentName,
      version,
      constructure,// Directly convert it to Date
      endDateContract: new Date(endDateContract), // Directly convert it to Date
      TypeSupport: updatedTypeSupport
    };

    const updateEquipmentSoft = await EquipmentSoft.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    ).populate({
      path: "TypeSupport",
      populate: {
        path: "type" // This will populate the `type` field within each item in the `TypeSupport` array
      }
    });

    if (!updateEquipmentSoft) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    res.status(200).json({ err: false, message: "Successful operation !", rows: updateEquipmentSoft });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.deleteEquipmentSoft = async (req, res) => {
  try {
    const equipmentSoft = await EquipmentSoft.findOneAndDelete({ _id: req.body._id });
    if (!equipmentSoft) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    const siteId = req.body.siteId;

    await Site.findByIdAndUpdate(
      { _id: siteId },
      { $pull: { listEquipmentSoft: req.body._id } },
      { new: true }
    );
    res.status(200).json({ err: false, message: "Successful operation !", rows: equipmentSoft });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.createImportinEquipmentSoft = async (req, res) => {
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
      let equipmentData = EquipmentSoft({
        equipmentName: listEquipe[index].equipmentName,
        version: listEquipe[index].version,
        constructure: listEquipe[index].constructure,
        TypeSupport: typeSupport._id.toString(),
        startDateSupport: listEquipe[index].startDateSupport,
        endDateSupport: listEquipe[index].endDateSupport,
        valid: val
      })
      await equipmentData.save()
      ListAddetEquipment.push(equipmentData)
    }
    const updateSite = await Site.findByIdAndUpdate(
      { _id },
      { $push: { listEquipmentSoft: ListAddetEquipment } },
      { new: true }
    ).populate({
      path: 'listEquipmentSoft',
      populate: {
        path: 'TypeSupport',
        model: 'TypeSupport'
      }
    })
    res.status(200).json({ err: false, message: "Successful operation !", rows: updateSite });

  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};



