const FollowUp = require('../models/followUpModel');
const Ticket = require('../models/ticketModel');
const File = require('../models/fileModel');
const { SERVER_URL } = require("../config/config");

exports.createFollowUp = async (req, res) => {
  try {
    const followUp = FollowUp(req.body);
    await followUp.save();
    res.status(200).json({ err: false, message: "Successful operation !", rows: followUp });
    // }
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.addTicket = async (req, res) => {
  const { title, description, employeeId, _id } = req.body;
  try {
    const files = req.files; // Get the array of uploaded files
    const uploadedFiles = [];
    for (const file of files) {
      const newFile = File({
        fileName: file.filename,
        path: SERVER_URL + file.destination + '/' + file.filename,
        title: file.originalname
      });
      await newFile.save();
      uploadedFiles.push(newFile);
    }
    const ticket = Ticket({ title, description, employeeId, listOfFiles: uploadedFiles });
    await ticket.save();
    const ticketId = ticket._id
    const updatedFollowUp = await FollowUp.findByIdAndUpdate(
      { _id },
      { ticketId },
      { new: true }
    );
    res.status(200).json({ err: false, message: "Successful operation !", rows: updatedFollowUp });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.removeTicket = async (req, res) => {
  const { ticketId, clientId } = req.body;
  try {
    const ticket = await Ticket.findByIdAndDelete(ticketId);
    if (!ticket) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    const workOrder = await WorkOrder.findOneAndUpdate(
      { clientId: clientId },
      { ticketId: null },
      { new: true }
    );
    res.status(200).json({ err: false, message: "Successful operation !", rows: workOrder });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getAllFollowUps = async (req, res) => {
  try {
    const followUp = await FollowUp.find();
    res.status(200).json({ err: false, message: "Successful operation !", rows: followUp });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
// Get a single followUp .populate('clientId', 'employeeId');
exports.getFollowUpById = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id).populate(
      [
        {
          path: 'clientId',
          model: 'Client',
          select: 'company email authority',
        },
        {
          path: 'employeeId',
          model: 'Employee',
          select: 'firstName lastName'
        },
        {
          path: 'ticketId',
          model: 'Ticket',
          select: 'title status creationDate description',
          populate: {
            path: 'listOfFiles',
            model: 'File'
          }
        },

      ]);
    if (!followUp) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    res.status(200).json({ err: false, message: "Successful operation !", rows: followUp });
  } catch (err) {
    res.status(500).json({ err: true, message: error.message });
  }
};
// Get a follow up by ticket id
exports.gefollowUpByTicketId = async (req, res) => {
  const ticketId = req.params.id;
  try {
    const followUp = await FollowUp.findOne({ ticketId });
    if (!followUp) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    res.status(200).json({ err: false, message: "Successful operation !", rows: followUp });
  } catch (err) {
    res.status(500).json({ err: true, message: error.message });
  }
};
// Update a user still working on it username
exports.updateFollowUp = async (req, res) => {
  try {
    const { _id, title, ticketId, status, signedBy } = req.body;
    const updatedFollowUp = await FollowUp.findByIdAndUpdate(
      { _id },
      { title, ticketId, status, signedBy },
      { new: true }
    );
    if (!updatedFollowUp) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    res.status(200).json({ err: false, message: "Successful operation !", rows: updatedFollowUp });
  } catch (err) {
    console.error(error);
    res.status(500).json({ err: true, message: error.message });
  }
};
// Delete a followUp
exports.deleteFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findByIdAndDelete(req.body._id);
    if (!followUp) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }

    res.status(200).json({ err: false, message: "Successful operation !", rows: followUp });
  } catch (err) {
    res.status(500).json({ err: true, message: error.message });
  }
};
