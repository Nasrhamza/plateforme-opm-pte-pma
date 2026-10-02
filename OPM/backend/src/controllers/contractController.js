const Contract = require('../models/contractModel');
const VisitePreventive = require('../models/vistepreventiveModel');
const Site = require('../models/siteModel');
const File = require('../models/fileModel')
const Folder = require('../models/folderModel');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const Client = require('../models/clientModel');
const Technicien = require('../models/technicienModel');
const Vistepreventive = require('../models/vistepreventiveModel');
const Ticket = require('../models/ticketModel');
const { SERVER_URL } = require('../config/config');
const VisiteInfogerance = require('../models/visiteInfogeranceModel');
const { Chat } = require('../models/chatModel');
const Solution = require('../models/solutionModel');
const Commercial = require('../models/commercialModel');
const Notification = require('../models/notificationModel');

exports.createContract = async (req, res) => {
  try {
    const { folderID: _id, data: contractData } = req.body;

    // Validate for INFOGERANCE type if necessary (You can adapt this validation if required for your new payload)
    if (contractData.type === 'INFOGERANCE' && !contractData.jourInfogerance) {
      return res.status(400).json({
        err: true,
        message: 'jourInfogerance is required for INFOGERANCE type.',
      });
    }

    // Ensure contractData includes typeSupport from listTypeSupport
    const typeSupports = contractData.listTypeSupport.map((item) => ({
      type: item.typeSupport,
      supportId: item.idSupport,
    }));

    // Check if any support IDs already exist in another contract
    const existingContract = await Contract.findOne({
      $or: typeSupports.map(typeSupport => ({ 'typeSupport.supportId': typeSupport.supportId })),
    });

    if (existingContract) {
      return res.status(400).json({
        err: true,
        message: 'One or more support IDs already exist in another contract.',
      });
    }

    // Assign typeSupports to contractData
    contractData.typeSupport = typeSupports;

    const contract = new Contract(contractData);

    // Handle INFOGERANCE type if applicable
    if (contractData.type === 'INFOGERANCE') {
      const { startDate, endDate, jourInfogerance } = contract;
      if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({
          err: true,
          message: 'Invalid startDate or endDate.',
        });
      }

      const dayMap = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 0,
      };

      const weekday = dayMap[jourInfogerance.toLowerCase()];
      if (weekday === undefined) {
        return res.status(400).json({
          err: true,
          message: 'Invalid jourInfogerance provided.',
        });
      }

      const visits = [];
      let currentDate = new Date(startDate);
      while (currentDate <= new Date(endDate)) {
        if (currentDate.getDay() === weekday) {
          visits.push(
            new VisiteInfogerance({
              title: `Infogerance Visit for ${contractData.id}`,
              date: new Date(currentDate),
              contractID: contract._id,
            })
          );
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      if (visits.length > 0) {
        const savedVisits = await VisiteInfogerance.insertMany(visits);
        contract.VisiteInfogerance.push(...savedVisits.map(v => v._id));
      }
    }

    // Save the contract
    await contract.save();

    // Update the folder with the new contract
    const updatedFolder = await Folder.findByIdAndUpdate(
      _id,
      { $push: { contractId: contract._id } },
      { new: true }
    );

    res.status(200).json({
      err: false,
      message: 'Contract successfully created!',
      rows: contract,
    });
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.updateContract = async (req, res) => {
  try {
    const { _id, id, type, nature, startDate, endDate, sla, jourInfogerance, dueDate,
      idSupport, idSupport1, listTypeSupport, listTypeSupport1 } = req.body;


    // Validate that listTypeSupport is an array and has at least one element
    if (!Array.isArray(listTypeSupport) || listTypeSupport.length === 0) {
      return res
        .status(400)
        .json({ err: true, message: "Invalid or empty listTypeSupport" });
    }

    // Map the array to the format required in DB
    const newTypeSupport = listTypeSupport.map((item) => ({
      type: item.typeSupport,
      supportId: item.idSupport,
    }));

    const updatedContract = await Contract.findByIdAndUpdate(
      _id,
      {
        id, type, nature, startDate, endDate, sla, jourInfogerance, dueDate,
        $set: { typeSupport: newTypeSupport } // Replace the existing typeSupport
      },
      { new: true }
    ).select('id type nature startDate endDate sla jourInfogerance typeSupport');

    if (!updatedContract) {
      return res.status(404).json({ err: true, message: "Contract not found" });
    }

    res.status(200).json({ err: false, message: "Successful operation!", rows: updatedContract });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate({
        path: 'listSite',
        populate: [
          {
            path: 'listEquipment',
            populate: { path: 'TypeSupport', model: 'TypeSupport' },
          },
          {
            path: 'listEquipmentSoft',
            populate: { path: 'TypeSupport', model: 'TypeSupport' },
          },
        ],
      })
      .populate('listOfFiles')
      .populate({
        path: 'technicians.technician',
        model: 'Technicien', // Must match the model name
        populate: {
          path: 'image', // Field inside Technicien to populate
        },
      })
      .populate({
        path: 'commercial',
        model: 'Commercial', // Must match the model name
        populate: {
          path: 'image', // Field inside Commercial to populate
        },
      })
      .populate({
        path: 'clients',
        populate: {
          path: 'image',
          model: 'File',
        },
      })
      .populate({
        path: 'Vistepreventive',
        populate: [
          { path: 'siteID', model: 'Site' }, // Explicit model if needed
          { path: 'technicians', model: 'Technicien' }, // Explicit model if needed
        ],
      })
      .populate('healthChecklist') // Assuming schema is correctly set with ref
      .exec();

    res.status(200).json({
      err: false,
      message: 'Successful operation!',
      rows: contract,
    });
  } catch (error) {
    res.status(500).json({
      err: true,
      message: error.message,
    });
  }
};
exports.getContractFilesByClient = async (req, res) => {
  try {
    const clientId = req.params.id
    const contracts = await Contract.find({ clients: clientId })
      .populate('listOfFiles')
      .populate({
        path: 'clients',
        populate: {
          path: 'image',
          model: 'File',
        },
      });

    const filteredFiles = contracts.flatMap(contract => {
      return contract.listOfFiles.filter(file =>
        file.listUsers.some(user => user.equals(clientId))
      );
    });

    res.status(200).json({
      err: false,
      message: 'Successful operation!',
      rows: filteredFiles,
    });
  } catch (error) {
    res.status(500).json({
      err: true,
      message: error.message,
    });
  }
};
exports.getContractByClient = async (req, res) => {
  try {
    const contract = await Contract.find({ client: req.params.id_client })
      .populate('listOfFiles')
      .populate({
        path: 'clients',
        populate: {
          path: 'image',
          model: 'File',
        },
      })
    res.status(200).json({
      err: false,
      message: 'Successful operation!',
      rows: contract,
    });
  } catch (error) {
    res.status(500).json({
      err: true,
      message: error.message,
    });
  }
};

exports.addSiteForContract = async (req, res) => {
  try {
    const { site: siteData, _id } = req.body;

    const contract = await Contract.findById(_id).populate('listSite');

    if (!contract) {
      return res.status(404).json({
        err: true,
        message: "Contract not found.",
      });
    }

    const siteExists = contract.listSite.some(existingSite => existingSite.nomSite === siteData.nomSite);

    if (siteExists) {
      return res.status(400).json({
        err: true,
        message: `The site with name '${siteData.nomSite}' already exists in this contract.`,
      });
    }

    const site = new Site(siteData);
    await site.save();

    contract.listSite.push(site._id);
    await contract.save();

    res.status(200).json({
      err: false,
      message: "Successful operation!",
      rows: site,
    });

  } catch (error) {
    console.error("Error adding site to contract:", error);
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.deleteSite = async (req, res) => {
  try {
    if (!req.body._id) {
      return res.status(400).json({ err: true, message: "No ID provided in the request!" });
    }
    const site = await Site.findOneAndDelete({ _id: req.body._id });
    if (!site) {
      return res.status(404).json({ err: true, message: "No site found with the given ID!" });
    }
    const contractId = req.body.contractId;
    await Contract.findByIdAndUpdate(
      { _id: contractId }, // Assuming the site document has an organizationID field
      { $pull: { listSite: site._id.toString() } },
      { new: true }
    );

    res.status(200).json({ err: false, message: "Operation successful!", rows: site });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getListEquipmentByContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params._id).populate({
      path: 'listSite',
      populate: [
        { path: 'listEquipment', model: 'Equipment' },
        { path: 'listEquipmentSoft', model: 'EquipmentSoft' },
      ],
    });

    // Flatten all equipment lists across all sites
    const allEquipmentHard = contract.listSite.flatMap(site => site.listEquipment);
    const allEquipmentSoft = contract.listSite.flatMap(site => site.listEquipmentSoft);

    res.status(200).json({
      err: false,
      message: "Successful operation!",
      rows: {
        listEquipmentHard: allEquipmentHard,
        listEquipmentSoft: allEquipmentSoft,
      },
    });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getListEquipmentByMultipleContract = async (req, res) => {
  try {
    const valid_equipments = {
      listEquipmentHard: [],
      listEquipmentSoft: []
    };

    const clientId = req.body.clientID;
    const clientContracts = await Contract.find({ clients: { $in: clientId } })
      .populate({
        path: "listSite",
        populate: [
          {
            path: "listEquipment",
            model: "Equipment",
            populate: {
              path: "TypeSupport.type",
              model: "TypeSupport",
            },
          },
          {
            path: "listEquipmentSoft",
            model: "EquipmentSoft",
            populate: {
              path: "TypeSupport.type",
              model: "TypeSupport",
            },
          },
        ],
      });

    // Process each contract
    clientContracts.forEach((contract) => {
      contract.listSite.forEach((site) => {
        // Process listEquipment (Hardware Equipment)
        if (site.listEquipment && site.listEquipment.length > 0) {
          site.listEquipment.forEach((equipment) => {
            if (equipment.TypeSupport) {
              equipment.TypeSupport.forEach((support) => {
                if (
                  new Date(support.endDateSupport) >= new Date() &&
                  new Date(equipment.endDateContract) >= new Date()
                ) {
                  valid_equipments.listEquipmentHard.push(equipment);
                }
              });
            }
          });
        }

        // Process listEquipmentSoft (Software Equipment)
        if (site.listEquipmentSoft && site.listEquipmentSoft.length > 0) {
          site.listEquipmentSoft.forEach((equipmentSoft) => {
            if (equipmentSoft.TypeSupport) {
              equipmentSoft.TypeSupport.forEach((support) => {
                if (
                  new Date(support.endDateSupport) >= new Date() &&
                  new Date(equipmentSoft.endDateContract) >= new Date()
                ) {
                  valid_equipments.listEquipmentSoft.push(equipmentSoft);
                }
              });
            }
          });
        }
      });
    });

    // Respond with the filtered equipment
    res.status(200).json({
      err: false,
      message: "Successful operation!",
      rows: valid_equipments
    });
  } catch (error) {
    res.status(500).json({
      err: true,
      message: error.message
    });
  }
};

exports.deleteVisitePrev = async (req, res) => {
  try {
    const visitePrev = await Vistepreventive.findByIdAndDelete(req.body._id);
    if (!visitePrev) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }

    res.status(200).json({ err: false, message: "Successful operation !", rows: visitePrev });
  } catch (err) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.updateVisitePrev = async (req, res) => {
  try {
    const { _id, title, startDate, endDate, status, siteID, technicien } = req.body;
    const updateVisite = await Vistepreventive.findByIdAndUpdate(
      { _id },
      { title, startDate, endDate, status, siteID, technicien },
      { new: true }
    )
      .populate('technicians')
      .populate('siteID');
    if (!updateVisite) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).json({ err: false, message: "Successful operation !", rows: updateVisite });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.getListEquipeContract = async (req, res) => {
  try {
    const { _id } = req.params;
    if (!_id) {
      return res.status(400).json({ err: true, message: "Contract ID is required!" });
    }
    const contract = await Contract.findById(_id)
      .populate({
        path: 'technicians.technician',
        populate: {
          path: 'image',
          model: 'File',
        },
      });

    if (!contract) {
      return res.status(404).json({ err: true, message: "Contract not found!" });
    }

    const listEquipe = contract.technicians || [];

    res.status(200).json({
      err: false,
      message: "Operation successful!",
      rows: listEquipe,
    });
  } catch (error) {
    // Handle unexpected errors
    console.error(error);
    res.status(500).json({ err: true, message: "Internal server error.", details: error.message });
  }
};


exports.addClient = async (req, res) => {
  const { email, firstName, lastName, typeAccount } = req.body.data;
  const { folderID, contractId } = req.body;

  try {
    // Validate incoming data
    if (!email || !firstName || !lastName || !folderID || !contractId) {
      return res.status(400).json({ err: true, message: 'Missing required fields' });
    }

    const userExists = await Client.findOne({ email });
    if (userExists) {
      return res.status(400).json({ err: true, message: 'User already exists' });
    }

    const folder = await Folder.findById(folderID);
    if (!folder) {
      return res.status(404).json({ err: true, message: 'Folder not found' });
    }

    const client = new Client(req.body.data);
    client.firstName = firstName;
    client.lastName = lastName;
    client.role = typeAccount;
    client.authority = 'client';
    client.company = folder.name;
    client.image = folder.logo;
    client.valid = true;

    const password = `${folder.name}@${new Date().getFullYear()}`;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    client.password = hashedPassword;

    const savedClient = await client.save();

    const updatedContract = await Contract.findByIdAndUpdate(
      contractId,
      { $push: { clients: savedClient._id } },
      { new: true }
    );

    if (!updatedContract) {
      return res.status(500).json({ err: true, message: 'Failed to update contract' });
    }

    // Respond with success
    res.status(200).json({
      err: false,
      message: 'Client added successfully!',
      rows: savedClient
    });
  } catch (error) {
    // General error handling
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.addCommercial = async (req, res) => {
  try {
    const commercial = await Commercial.findById(req.body.commercial).select("-password");
    await Contract.findByIdAndUpdate(
      req.body.contractId,
      { commercial: commercial._id },
      { new: true }
    );
    res.status(200).json({
      err: false,
      message: "Successful operation !",
      rows: commercial
    });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
}

exports.addTechnician = async (req, res) => {
  try {
    const { technician, contractId, teamLeader } = req.body;

    const tech = await Technicien.findById(technician).populate('image').select("-password");
    if (!tech) {
      return res.status(404).json({
        err: true,
        message: "Technician not found",
      });
    }

    const contract = await Contract.findByIdAndUpdate(
      contractId,
      {
        $push: {
          technicians: { technician: tech._id, teamLeader: teamLeader || false },
        },
      },
      { new: true, runValidators: true } // Return updated document and apply schema validators
    ).populate({
      path: 'technicians.technician',
      populate: {
        path: 'image',
        model: 'File',
      },
    });

    if (!contract) {
      return res.status(404).json({
        err: true,
        message: "Contract not found",
      });
    }

    res.status(200).json({
      err: false,
      message: "Technician added successfully!",
      rows: contract.technicians,
    });
  } catch (error) {
    res.status(500).json({
      err: true,
      message: error.message,
    });
  }
};

exports.AddOnePlanificationVistePreventive = async (req, res) => {
  try {
    const visite = { ...req.body.data, contractID: req.body.contractID };
    const Vistepreventive = await VisitePreventive.create(visite);
    const contract = await Contract.findByIdAndUpdate(
      req.body.contractID,
      { $push: { Vistepreventive: Vistepreventive } },
      { new: true }
    );

    const chat = await Chat.create({});
    const solution = await Solution.create({ solution: '' });

    const lastTicket = await Ticket.findOne().sort({ number: -1 }).exec();
    const lastNumber = lastTicket ? +lastTicket.number.split('-')[1] : 0;
    const newNumber = String(lastNumber + 1).padStart(5, '0');
    const currentYear = new Date().getFullYear();
    const yearShort = String(currentYear).slice(-2);
    const ticketNumber = `${yearShort}-${newNumber}`;

    const ticket = await Ticket.create({
      contractId: contract._id,
      description: 'Ticket generated for preventive visit',
      siteId: Vistepreventive.siteID,
      clientId: Vistepreventive.clientId,
      title: Vistepreventive.title,
      technicienId: Array.isArray(Vistepreventive.technicians) ? Vistepreventive.technicians : [Vistepreventive.technicians],
      finishDate: Vistepreventive.endDate,
      status: 'Assigned',
      chat: chat._id,
      solution: solution._id,
      number: ticketNumber, // Add ticket number here
    });
    Vistepreventive.ticket = ticket._id;
    await Vistepreventive.save();
    const p = await Contract.findById(contract._id)
      .populate({
        path: "Vistepreventive",
        populate: [
          { path: "siteID" },
          { path: "technicians" }
        ]
      });

    res.status(200).json({
      err: false,
      message: "Successful operation add!",
      rows: p.Vistepreventive
    });

  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getAllContracts = async (req, res) => {
  try {
    const contract = await Contract.find()
    res.status(200).json({ err: false, message: "Successful operation !", rows: contract });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.deleteUserfromContract = async (req, res) => {
  try {
    const valid = false;
    const _id = req.body._id
    const user = await User.findOneAndUpdate(
      { _id },
      { valid },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ err: true, message: "No User found !", rows: [] });
    }
    const contractID = req.body.contrcatID;
    await Contract.findByIdAndUpdate(
      { _id: contractID },
      { $pull: { clients: req.body._id } },
      { new: true }
    );
    res.status(200).json({ err: false, message: "Operation successful!", rows: user });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.deleteVisaAvisContract = async (req, res) => {
  try {
    const valid = false;
    const _id = req.body._id
    const updatedClient = await Client.findOneAndUpdate(
      { _id },
      { valid },
      { new: true }
    );
    const contractID = req.body.contractID;
    if (!contractID) {
      return res.status(400).json({ err: true, message: "Contract ID is required!" });
    }
    const result = await Contract.findByIdAndUpdate(
      contractID,
      { $unset: { visAvis: "" } }
    );
    if (!result) {
      return res.status(404).json({ err: true, message: "No Contract found !", result: [] });
    }
    res.status(200).json({ err: false, message: "Operation successful!", rows: result });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.deleteResponsableEquipeContract = async (req, res) => {
  try {
    const contractID = req.body.contractID;
    if (!contractID) {
      return res.status(400).json({ err: true, message: "Contract ID is required!" });
    }
    const result = await Contract.findByIdAndUpdate(
      contractID,
      { $unset: { responsableEquipeTechnique: "" } }
    );
    if (!result) {
      return res.status(404).json({ err: true, message: "No Contract found !", result: [] });
    }
    res.status(200).json({ err: false, message: "Operation successful!", rows: result });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.deleteMemberEquipefromContract = async (req, res) => {
  try {
    const contractID = req.body.contractID;
    const techID = req.body.id;
    const contract = await Contract.findById(contractID);
    if (!contract) {
      return res.status(404).json({ err: true, message: "Contract not found" });
    }
    const technicianIndex = contract.technicians.findIndex(
      (tech) => tech.technician.toString() === techID
    );
    if (technicianIndex === -1) {
      return res.status(404).json({ err: true, message: "Technician not found in contract" });
    }
    const updatedContract = await Contract.findByIdAndUpdate(
      contractID,
      { $pull: { technicians: { technician: techID } } },
      { new: true }
    );
    res.status(200).json({ err: false, message: "Operation successful!", rows: updatedContract });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.updateCustomers = async (req, res) => {
  try {
    const { _id, email, phoneNumber, valid } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      { _id },
      { email, phoneNumber, valid },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).json({ err: false, message: "Operation successful!", rows: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal server error" });
  }
};
exports.shareFile = async (req, res) => {
  try {
    const { fileId, clients } = req.body;

    const updatedFile = await File.findByIdAndUpdate(
      fileId,
      { $set: { listUsers: clients } }, // Replace listUsers with the new clients array
      { new: true }
    );

    if (!updatedFile) {
      return res.status(404).json({ err: true, message: "No file found!" });
    }

    res.status(200).json({ err: false, message: "File shared successfully!", rows: updatedFile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.deleteContract = async (req, res) => {
  try {
    const contract_id = req.body._id;
    const contract = await Contract.findOneAndDelete({ _id: contract_id });

    if (!contract) {
      return res.status(404).json({ err: true, message: "No contract found with the given ID!" });
    }

    const folderId = req.body.folderId;
    await Folder.findByIdAndUpdate(
      folderId,
      { $pull: { contractId: contract._id.toString() } },
      { new: true }
    );

    VisitePreventive.deleteMany({ contractID: contract_id });
    VisiteInfogerance.deleteMany({ contractID: contract_id });

    const tickets = await Ticket.find({ contractId: contract_id });
    const ticketIds = tickets.map(ticket => ticket._id);

    Notification.deleteMany({ ticketId: { $in: ticketIds } });

    Ticket.deleteMany({ contractId: contract_id });

    res.status(200).json({ err: false, message: "Operation successful!", rows: contract });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.addFileToContract = async (req, res) => {
  try {
    const contratSigneFiles = req.files.contratSigneFiles || [];
    const matriceDescaladeFiles = req.files.matriceDescaladeFiles || [];
    const autreFiles = req.files.autreFiles || [];
    const uploadedFiles = [];

    for (const file of contratSigneFiles) {
      const newFile = File({
        fileName: file.filename,
        path: SERVER_URL + file.destination + '/' + file.filename,
        title: "Contrat Signé",
      });
      await newFile.save();
      uploadedFiles.push(newFile);
    }

    for (const file of matriceDescaladeFiles) {
      const newFile = File({
        fileName: file.filename,
        path: SERVER_URL + file.destination + '/' + file.filename,
        title: "Matrice D'escalade",
      });
      await newFile.save();
      uploadedFiles.push(newFile);
    }
    for (const file of autreFiles) {
      const newFile = File({
        fileName: file.filename,
        path: SERVER_URL + file.destination + '/' + file.filename,
        title: file.originalname.toString(),
      });
      await newFile.save();
      uploadedFiles.push(newFile);
    }

    const contract = await Contract.findByIdAndUpdate(
      req.body._id,
      { $push: { listOfFiles: uploadedFiles } },
      { new: true }
    );
    res.status(200).json({
      err: false,
      message: "Successful operation!",
      rows: uploadedFiles
    });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

