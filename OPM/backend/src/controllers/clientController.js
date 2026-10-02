const { SERVER_URL } = require('../config/config');
const Client = require('../models/clientModel');
const Contract = require('../models/contractModel');
const User = require('../models/userModel');
const File = require('../models/fileModel');

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate('image');
    if (!client) {
      return res.status(404).json({ message: 'client user not found' });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client', error });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const client = await Client.find()
    res.status(200).json({ err: false, message: "Successful operation !", rows: client });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getListContractByClient = async (req, res) => {
  try {
    const id = req.params._id;
    const contracts = await Contract.find({
      $or: [
        { visAvis: id },
        { associatedCustomerList: id },

      ]
    })
      .populate([
        {
          path: 'technicians',
          model: 'Technicien',
          populate: { path: 'image', model: 'File' },
          select: 'image'
        },
      ]);

    res.status(200).json({ err: false, message: "Successful operation !", rows: contracts });
  } catch (err) {
    res.status(500).json({ err: true, message: err.message });
  }
};
exports.getListContractByTechnician = async (req, res) => {
  try {
    const id = req.params._id;
    const contracts = await Contract.find({ 'technicians': id })
      .populate([
        {
          path: 'technicians',
          model: 'Technicien',
          populate: { path: 'image', model: 'File' },
          select: 'image'
        },
      ]);

    res.status(200).json({ err: false, message: "Successful operation!", rows: contracts });
  } catch (err) {
    res.status(500).json({ err: true, message: err.message });
  }
};

exports.affectOledCustemer = async (req, res) => {
  try {
    const { _id, client, role } = req.body.data;

    if (client !== null) {
      newCustomer = await Client.findByIdAndUpdate(
        { _id: client },
        { role: role, valid: true },
        { new: true }
      );
      const contract = await Contract.findByIdAndUpdate(
        { _id },
        { $push: { clients: client } },
        { new: true }
      );
    }
    updatedContract = await Contract.findById(_id)
      .populate([
        {
          path: 'clients',
          model: 'Client',
        }
      ])
    res.status(200).json({
      err: false,
      message: "Successful operation !",
      rows: {
        updatedContract
      }
    });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
}

exports.getListClientOldNotAffected = async (req, res) => {
  try {
    const companyName = req.params.companyName;
    const client = await Client.find({ company: companyName });
    res.status(200).json({ err: false, message: "Successful operation !", rows: client });
  } catch (err) {
    res.status(500).json({ err: true, message: err.message });
  }
};

exports.getListClientDejaAffected = async (req, res) => {
  try {
    const id = req.params._id;
    const contract = await Contract.findOne({ _id: id })
      .populate([
        {
          path: 'clients',
          model: 'Client',
        }
      ])
    let listId = []

    let ListClients = contract.clients
    ListClients.forEach(element => {
      listId.push(element._id)
    });

    res.status(200).json({ err: false, message: "Successful operation !", rows: listId });
  } catch (err) {
    res.status(500).json({ err: true, message: err.message });
  }
};

exports.getAllClientsByValid = async (req, res) => {
  const { valid } = req.params;

  try {
    if (!valid) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    const client = await Client.find({ valid });
    res.status(200).json({ err: false, message: "Successful operation !", rows: client });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.updateStatClient = async (req, res) => {
  try {
    const { _id, valid } = req.body;
    const updatedClient = await Client.findOneAndUpdate(
      { _id },
      { valid },
      { new: true }
    );
    if (!updatedClient) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    res.status(200).json({ err: false, message: "Account status changes successfully", rows: updatedClient });
  } catch (err) {
    console.error(error);
    res.status(500).json({ err: true, message: error.message });
  }
};

// Update a user client
exports.updateClient = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, about } = req.body;
    const client = await Client.findById(req.params.id).populate('image');
    const image = req.file;

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Update fields if provided
    if (firstName) client.firstName = firstName;
    if (lastName) client.lastName = lastName;
    if (email) client.email = email;
    if (phoneNumber) client.phoneNumber = phoneNumber;
    if (about) client.about = about;
    // Update profile picture if a new one is uploaded
    if (image) {
      // Create a new file for the uploaded image
      const newFile = new File({
        fileName: image.filename,
        path: `${SERVER_URL}uploads/${image.filename}`,
        title: image.originalname
      });
      await newFile.save();
      client.image = newFile._id;
    }
    await client.save();

    // Fetch the updated technician with populated image
    const payload = await Client.findById(req.params.id).populate('image');
    res.status(200).json({ message: 'Account updated successfully', data: payload });

  } catch (error) {
    res.status(500).json({ message: 'Error updating Client', error });
  }
};

// Delete a client
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { email: req.body.email },
      { valid: false },
      { new: true }
    );
    if (!client) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }

    res.status(200).json({ err: false, message: "Successful operation !", rows: client });
  } catch (err) {
    res.status(500).json({ err: true, message: error.message });
  }
};
