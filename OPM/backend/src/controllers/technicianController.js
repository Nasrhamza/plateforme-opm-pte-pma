const File = require('../models/fileModel');
const Technicien = require('../models/technicienModel');
const { SERVER_URL } = require("../config/config");
const { sendEmailWithTemplate } = require("../controllers/emailController");
const User = require('../models/userModel');
const Contract = require('../models/contractModel');
const Ticket = require('../models/ticketModel');

exports.getTechnicianById = async (req, res) => {
  try {
    const technicien = await Technicien.findById(req.params.id)
      .populate('image');
    if (!technicien) {
      return res.status(404).json({ message: 'Technicien not found' });
    }
    res.status(200).json(technicien);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Technicien', error });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const users = await User.find({ authority: { $in: ["technician", "assistant", "pmo", "commercial"] } })
      .populate('image');

    res.status(200).json({ err: false, message: "Successful operation!", rows: users });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getListTechnician = async (req, res) => {
  try {
    const users = await Technicien.find().populate('image').lean();

    if (!users.length) {
      return res.status(404).json({ err: true, message: "No employees found", rows: [] });
    }

    res.status(200).json({ err: false, message: "Successful operation!", rows: users });
  } catch (error) {
    res.status(500).json({ err: true, message: "Internal Server Error" });
  }
};
exports.getListSupervisor = async (req, res) => {
  try {
    // Fetch all tickets and select only superviserId
    const tickets = await Ticket.find({}, 'supervisor').lean();

    if (!tickets.length) {
      return res.status(404).json({ err: true, message: "No tickets found", rows: [] });
    }

    // Extract unique supervisor IDs
    const supervisorIds = [...new Set(tickets.map(t => t.supervisor).filter(Boolean))];

    if (!supervisorIds.length) {
      return res.status(404).json({ err: true, message: "No supervisors assigned to tickets", rows: [] });
    }

    // Fetch supervisor details
    const supervisors = await Technicien.find({ _id: { $in: supervisorIds } })
      .populate('image') // if you want to populate images
      .lean();

    res.status(200).json({ err: false, message: "Successful operation!", rows: supervisors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: true, message: "Internal Server Error" });
  }
};

exports.updateStatTech = async (req, res) => {
  try {
    const { _id, valid } = req.body;

    // Update technician status
    const updatedTechnician = await Technicien.findOneAndUpdate(
      { _id },
      { valid },
      { new: true }
    );

    if (!updatedTechnician) {
      return res.status(404).json({ err: true, message: "No (data, operation) (found, done)!" });
    }

    if (valid === true) {
      sendEmailWithTemplate(
        updatedTechnician.email,
        "Registration Successful",
        "accountActivated",
        { name: updatedTechnician.firstName }
      );
    } else if (valid === false) {
      sendEmailWithTemplate(
        updatedTechnician.email,
        "Account Disabled",
        "accountDisabled",
        { name: updatedTechnician.firstName }
      );
    }

    // Respond with success
    res.status(200).json({
      err: false,
      message: "Account status changed successfully",
      rows: updatedTechnician,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: true, message: error.message });
  }
};


exports.getAllEmployeesByValid = async (req, res) => {
  const { valid } = req.params;
  try {
    if (!valid) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    // const employee = await Employee.find({ valid });
    const technicien = await Technicien.find({ valid: valid });
    // .find({clientId:user._id})
    res.status(200).json({ err: false, message: "Successful operation !", rows: technicien });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.getAllEmployeesByContract = async (req, res) => {
  const { id } = req.params; // Assuming you might need the contract ID or other parameters
  try {
    const contract = await Contract.findById(id).populate('technicians.technician');
    const contractTechnicians = contract.technicians.map(t => t.technician._id);
    const technicien = await Technicien.find({
      _id: { $nin: contractTechnicians },
      valid: true, // Filter by valid technicians, if necessary
    }).populate('image');
    res.status(200).json({
      err: false,
      message: "Successful operation!",
      rows: technicien,
    });
  } catch (error) {
    res.status(500).json({
      err: true,
      message: error.message,
    });
  }
};

exports.getAllEmployeesByAuthority = async (req, res) => {
  const { authority } = req.params;
  try {
    if (!authority) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    const employee = await Employee.find({ authority });
    res.status(200).json({ err: false, message: "Successful operation !", rows: employee });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getEmployeeByEmail = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ email: req.body.email });
    if (!employee) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    res.status(200).json({ err: false, message: "Successful operation !", rows: employee });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.updateTechnician = async (req, res) => {
  try {
    const { email, firstName, lastName, birthDate, phoneNumber, valid } = req.body;
    const technician = await Technicien.findById(req.params.id).populate('image');
    const image = req.file;

    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    if (email) technician.email = email;
    if (firstName) technician.firstName = firstName;
    if (lastName) technician.lastName = lastName;
    if (phoneNumber) technician.phoneNumber = phoneNumber;
    if (birthDate) technician.birthDate = birthDate;
    if (valid !== undefined) technician.valid = valid;

    if (image) {
      const newFile = new File({
        fileName: image.filename,
        path: `${SERVER_URL}uploads/${image.filename}`,
        title: image.originalname
      });
      await newFile.save();
      technician.image = newFile._id;
    }
    await technician.save();
    const payload = await Technicien.findById(req.params.id).populate('image');
    res.status(200).json({ message: 'Account updated successfully', data: payload });

  } catch (error) {
    res.status(500).json({ message: 'Error updating technician', error });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { email: req.body.email },
      { valid: false },
      { new: true }
    );
    if (!employee) {
      return res.status(404).json({ err: true, message: 'No (data,operation) (found,done) ! ' });
    }
    res.status(200).json({ err: false, message: "Successful operation !", rows: employee });
  } catch (error) {
    res.status(500).send({ err: true, message: error.message });
  }
};
