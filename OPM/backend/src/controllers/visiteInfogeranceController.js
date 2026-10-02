const Contract = require('../models/contractModel');
const VisiteInfogerance = require('../models/visiteInfogeranceModel');
const VisteInfogerance = require('../models/visiteInfogeranceModel');
const Vistepreventive = require('../models/vistepreventiveModel');

exports.getAllVisite = async (req, res) => {
  try {
    const listVisteInfog = await VisteInfogerance.find()
      .populate('contractID'); // Specify the fields to populate
    let listEvent = listVisteInfog.map((element) => {
      return {
        id: element._id.toString(),
        title: element.title,
        start: element.date,
        end: element.date,
        status: element.status,
        contractNature: element.contractID.nature,
        contractType: element.contractID.type,
        contractStartDate: element.contractID.startDate,
        contractEndDate: element.contractID.endDate,
        contractSLA: element.contractID.sla,
      };
    });
    res.status(200).json({ err: false, message: "Successful operation!", rows: listEvent });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getAllVisiteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const contracts = await Contract.find({ clients: id });

    if (!contracts.length) {
      return res.status(404).json({ err: true, message: "No contracts found for this client." });
    }

    const contractIds = contracts.map(contract => contract._id);
    const visits = await VisteInfogerance.find({ contractID: { $in: contractIds } }).populate("contractID");

    const listEvent = visits.map(visit => ({
      id: visit._id.toString(),
      title: visit.title,
      start: visit.date,
      end: visit.date,
      status: visit.status,
      contractNature: visit.contractID.nature,
      contractType: visit.contractID.type,
      contractStartDate: visit.contractID.startDate,
      contractEndDate: visit.contractID.endDate,
      contractSLA: visit.contractID.sla,
    }));

    res.status(200).json({ err: false, message: "Successful operation!", rows: listEvent });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.getAllVisiteCommercial = async (req, res) => {
  try {
    const { id } = req.params;
    const contracts = await Contract.find({ commercial: id });

    if (!contracts.length) {
      return res.status(404).json({ err: true, message: "No contracts found for this commercial." });
    }

    const contractIds = contracts.map(contract => contract._id);
    const visits = await VisteInfogerance.find({ contractID: { $in: contractIds } }).populate("contractID");

    const listEvent = visits.map(visit => ({
      id: visit._id.toString(),
      title: visit.title,
      start: visit.date,
      end: visit.date,
      status: visit.status,
      contractNature: visit.contractID.nature,
      contractType: visit.contractID.type,
      contractStartDate: visit.contractID.startDate,
      contractEndDate: visit.contractID.endDate,
      contractSLA: visit.contractID.sla,
    }));

    res.status(200).json({ err: false, message: "Successful operation!", rows: listEvent });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getAllVisiteTech = async (req, res) => {
  try {
    const { id } = req.params;
    const contracts = await Contract.find({ 'technicians.technician': id });

    if (!contracts.length) {
      return res.status(404).json({ err: true, message: "No contracts found for this technician." });
    }

    const contractIds = contracts.map(contract => contract._id);
    const visits = await VisteInfogerance.find({ contractID: { $in: contractIds } }).populate("contractID");

    const listEvent = visits.map(visit => ({
      id: visit._id.toString(),
      title: visit.title,
      start: visit.date,
      end: visit.date,
      status: visit.status,
      contractNature: visit.contractID.nature,
      contractType: visit.contractID.type,
      contractStartDate: visit.contractID.startDate,
      contractEndDate: visit.contractID.endDate,
      contractSLA: visit.contractID.sla,
    }));

    res.status(200).json({ err: false, message: "Successful operation!", rows: listEvent });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getOneVis = async (req, res) => {
  try {
    const visId = req.params._id;

    const VisteInfog = await VisiteInfogerance.findById(visId).populate('contractID');

    if (!VisteInfog) {
      return res.status(404).json({ err: true, message: "Visite not found." });
    }
    res.status(200).json({ err: false, message: "Successful operation!", rows: VisteInfog });
  } catch (error) {
    console.error('Error fetching Visite:', error);
    res.status(500).json({ err: true, message: "Server error: " + error.message });
  }
};
