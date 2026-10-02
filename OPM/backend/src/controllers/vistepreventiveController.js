const Vistepreventive = require('../models/vistepreventiveModel');
const Folder = require('../models/folderModel');

exports.getAllVisite = async (req, res) => {
  try {
    const listVisteprev = await Vistepreventive.find()
      .populate('technicians')
      .populate('siteID')
      .populate('rapportId')
      .populate('contractID')
      .populate('ticket');
    let listEvent = listVisteprev.map((element) => {
      const techs = element.technicians.map(technician => `${technician.firstName} ${technician.lastName}`).join(', ');
      return {
        id: element._id.toString(),
        title: element.title + ' ' + element.siteID.nomSite + ' ' + element.siteID.adress,
        start: element.startDate,
        end: element.endDate,
        status: element.status,
        technician: techs,
        siteName: element.siteID.nomSite,
        address: element.siteID.adress,
        rapportId: element.rapportId || '',
        contractNature: element.contractID.nature,
        contractType: element.contractID.type,
        contractStartDate: element.contractID.startDate,
        contractEndDate: element.contractID.endDate,
        contractSLA: element.contractID.sla,
        contractID: element.contractID._id,
      }
    },
    );
    res.status(200).json({ err: false, message: "Successful operation!", rows: listEvent });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.getAllVisiteClient = async (req, res) => {
  try {
    const { id } = req.params; // Assuming 'id' is the client ID

    const listVisteprev = await Vistepreventive.find({ clientId: id }) // Filter visits by clientId
      .populate('technicians')
      .populate('siteID')
      .populate('rapportId')
      .populate('contractID')
      .populate('ticket');

    let listEvent = listVisteprev.map((element) => {
      const techs = element.technicians.map(technician => `${technician.firstName} ${technician.lastName}`).join(', ');
      return {
        id: element._id.toString(),
        title: `${element.title} ${element.siteID.nomSite} ${element.siteID.adress}`,
        start: element.startDate,
        end: element.endDate,
        status: element.status,
        technician: techs,
        siteName: element.siteID.nomSite,
        address: element.siteID.adress,
        rapportId: element.rapportId || '',
        contractNature: element.contractID.nature,
        contractType: element.contractID.type,
        contractStartDate: element.contractID.startDate,
        contractEndDate: element.contractID.endDate,
        contractSLA: element.contractID.sla,
        contractID: element.contractID._id,
      };
    });
    res.status(200).json({ err: false, message: "Successful operation!", rows: listEvent });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.getAllVisiteCommercial = async (req, res) => {
  try {
    const { id } = req.params; // Assuming 'id' is the client ID

    const listVisteprev = await Vistepreventive.find({ commercial: id }) // Filter visits by clientId
      .populate('technicians')
      .populate('siteID')
      .populate('rapportId')
      .populate('contractID')
      .populate('ticket');

    let listEvent = listVisteprev.map((element) => {
      const techs = element.technicians.map(technician => `${technician.firstName} ${technician.lastName}`).join(', ');
      return {
        id: element._id.toString(),
        title: `${element.title} ${element.siteID.nomSite} ${element.siteID.adress}`,
        start: element.startDate,
        end: element.endDate,
        status: element.status,
        technician: techs,
        siteName: element.siteID.nomSite,
        address: element.siteID.adress,
        rapportId: element.rapportId || '',
        contractNature: element.contractID.nature,
        contractType: element.contractID.type,
        contractStartDate: element.contractID.startDate,
        contractEndDate: element.contractID.endDate,
        contractSLA: element.contractID.sla,
        contractID: element.contractID._id,
      };
    });
    res.status(200).json({ err: false, message: "Successful operation!", rows: listEvent });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.getAllVisiteTech = async (req, res) => {
  try {
    const { id } = req.params; // Assuming 'id' is the client ID

    const listVisteprev = await Vistepreventive.find({ technicians: id }) // Filter visits by clientId
      .populate('technicians')
      .populate('siteID')
      .populate('rapportId')
      .populate('contractID')
      .populate('ticket');

    let listEvent = listVisteprev.map((element) => {
      const techs = element.technicians.map(technician => `${technician.firstName} ${technician.lastName}`).join(', ');
      return {
        id: element._id.toString(),
        title: `${element.title} ${element.siteID.nomSite} ${element.siteID.adress}`,
        start: element.startDate,
        end: element.endDate,
        status: element.status,
        technician: techs,
        siteName: element.siteID.nomSite,
        address: element.siteID.adress,
        rapportId: element.rapportId || '',
        contractNature: element.contractID.nature,
        contractType: element.contractID.type,
        contractStartDate: element.contractID.startDate,
        contractEndDate: element.contractID.endDate,
        contractSLA: element.contractID.sla,
        contractID: element.contractID._id,
      };
    });
    res.status(200).json({ err: false, message: "Successful operation!", rows: listEvent });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getOneVis = async (req, res) => {
  try {
    const Visteprev = await Vistepreventive.findById(req.params._id)
      .populate('technicians')
      .populate('siteID')
      .populate('rapportId')
      .populate('ticket')
      .populate({
        path: 'contractID',
        populate: [
          {
            path: 'technicians',
            model: 'Technicien'
          },
          {
            path: 'clients'
          }
        ]
      });
    const folder = await Folder.findOne({ contractId: Visteprev.contractID._id })
    const client = folder.name
    res.status(200).json({
      err: false,
      message: "Successful operation!",
      rows: Visteprev,
      client: client
    });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};