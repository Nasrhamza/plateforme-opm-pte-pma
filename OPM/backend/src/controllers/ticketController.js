const Ticket = require('../models/ticketModel');
const File = require('../models/fileModel');
const checkSLA = require('../middlewares/SLAcheck');
const cron = require('node-cron');
const Client = require('../models/clientModel');
const HelpdeskClient = require('../models/helpdeskClient');
const Contract = require('../models/contractModel');
const Rapport = require('../models/rapportModel');
const Technicien = require('../models/technicienModel');
const moment = require('moment');
const { Chat } = require('../models/chatModel');
const Solution = require('../models/solutionModel');
const { SERVER_URL } = require("../config/config");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const User = require('../models/userModel');
const { sendEmailWithTemplate } = require('./emailController');
require('moment-timezone');
const soap = require('soap');
const { notifyUser } = require('../../socket');
const Notification = require('../models/notificationModel');
const Admin = require('../models/adminModel');
const EquipmentSoft = require('../models/equipmentsoftModel');
const Equipment = require('../models/equipmentModel');
const Site = require('../models/siteModel');
const Folder = require('../models/folderModel');
const { ObjectId } = require('mongodb');
const { default: mongoose } = require('mongoose');
const Spare = require('../models/spareModel');

exports.createTicket = async (req, res) => {
  try {
    const { equipment } = req.body;
    const hardEquipment = await Equipment.findById(equipment);
    const softEquipment = await EquipmentSoft.findById(equipment);
    const site = await Site.findOne({
      $or: [
        { listEquipment: equipment },
        { listEquipmentSoft: equipment }
      ]
    });

    if (hardEquipment) {
      req.body.equipmentHardId = equipment;
    } else if (softEquipment) {
      req.body.equipmentSoftId = equipment;
    } else {
      return res.status(400).json({ err: true, message: "Invalid equipment ID" });
    }

    const contract = await Contract.findOne({ listSite: site._id });
    req.body.contractId = contract._id;
    const ticket = new Ticket(req.body);

    if (req.files) {
      const files = req.files;
      const uploadedFiles = [];
      for (const file of files) {
        const newFile = new File({
          fileName: file.filename,
          path: SERVER_URL + file.destination + '/' + file.filename,
          title: file.originalname,
        });
        await newFile.save();
        uploadedFiles.push(newFile);
      }
      ticket.listOfFiles = uploadedFiles;
    }

    const lastTicket = await Ticket.findOne().sort({ number: -1 }).exec();
    const lastNumber = lastTicket ? +lastTicket.number.split('-')[1] : 0;
    const newNumber = String(lastNumber + 1).padStart(5, '0');
    const currentYear = new Date().getFullYear();
    const yearShort = String(currentYear).slice(-2);
    ticket.number = `${yearShort}-${newNumber}`;

    const chat = await Chat.create({ messages: [] });
    const teamLeader = contract.technicians.find(tech => tech.teamLeader === true);
    ticket.chat = chat._id;
    ticket.siteId = site._id;
    ticket.supervisor = teamLeader.technician
    await ticket.save();

    const admins = await Admin.find({ authority: 'admin' });
    const users = await User.find({ authority: { $in: ['pmo', 'assistant'] } });

    console.log(teamLeader);

    const usersToNotify = [
      ticket.clientId.toString(),
      ticket.supervisor.toString(),
      ...users.map(user => user._id.toString()),
    ];
    const adminsToNotify = admins.map(admin => admin._id.toString());

    const allRecipients = [...usersToNotify, ...adminsToNotify];

    const populatedTicket = await Ticket.findById(ticket._id).populate({
      path: 'clientId',
      model: 'User',
      populate: { path: 'image', model: 'File' },
    });

    const notifications = allRecipients.map(userId => ({
      recipient: userId,
      message: `Ticket ${ticket.number} has been created from client ${populatedTicket.clientId.firstName.toUpperCase()} ${populatedTicket.clientId.lastName.toUpperCase()}.`,
      ticketId: ticket._id,
      type: "new-ticket",
    }));

    const savedNotifications = await Notification.insertMany(notifications);

    await Promise.all(
      savedNotifications.map(async notification => {
        const notificationPayload = {
          ticketId: populatedTicket,
          _id: notification._id,
          read: false,
          type: notification.type,
          message: notification.message,
        };
        try {
          await notifyUser(notification.recipient, notificationPayload, notification.type);
        } catch (err) {
          console.error(`Failed to notify user ${notification.recipient}:`, err);
        }
      })
    );
    // Sending email notifications
    const emailSubject = `New Ticket Created: ${populatedTicket.number}`;
    const emailTemplate = 'newTicket';
    const emailVariables = {
      ticketNumber: populatedTicket.number,
      ticketTitle: populatedTicket.title,
      ticketDescription: populatedTicket.description,
      ticketCreator: `${populatedTicket.clientId.firstName} ${populatedTicket.clientId.lastName}`,
    };

    async function sendEmailsSequentially(recipients, subject, template, variables) {
      for (const recipientId of recipients) {
        const recipient = await User.findById(recipientId) || await Admin.findById(recipientId);
        if (recipient?.email) {
          try {
            await sendEmailWithTemplate(recipient.email, subject, template, variables);
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay to avoid SMTP rate limit
          } catch (err) {
            console.error(`Failed to send email to ${recipient.email}:`, err);
          }
        }
      }
    }
    res.status(200).json({ err: false, message: "Successful operation!", rows: ticket });

    setImmediate(async () => {
      await sendEmailsSequentially(usersToNotify, emailSubject, emailTemplate, emailVariables);
      await sendEmailsSequentially(adminsToNotify, emailSubject, emailTemplate, emailVariables);
    });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.createTicketHelpDesk = async (req, res) => {
  try {

    const ticket = new Ticket(req.body);
    if (req.files) {
      const files = req.files;
      const uploadedFiles = [];
      for (const file of files) {
        const newFile = new File({
          fileName: file.filename,
          path: SERVER_URL + file.destination + '/' + file.filename,
          title: file.originalname,
        });
        await newFile.save();
        uploadedFiles.push(newFile);
      }
      ticket.listOfFiles = uploadedFiles;
    }

    const lastTicket = await Ticket.findOne().sort({ number: -1 }).exec();
    const lastNumber = lastTicket ? +lastTicket.number.split('-')[1] : 0;
    const newNumber = String(lastNumber + 1).padStart(5, '0');
    const currentYear = new Date().getFullYear();
    const yearShort = String(currentYear).slice(-2);
    ticket.number = `${yearShort}-${newNumber}`;
    ticket.isHelpdesk = true
    const chat = await Chat.create({ messages: [] });
    ticket.chat = chat._id;
    ticket.status = 'Assigned';
    await ticket.save();

    const populatedTicket = await Ticket.findById(ticket._id).populate({
      path: 'clientId',
      model: 'helpdeskClient',
      populate: { path: 'image', model: 'File' },
    });
    const admins = await Admin.find({ authority: 'admin' });
    const users = await User.find({ authority: { $in: ['pmo', 'assistant'] } });

    const usersToNotify = [
      ...populatedTicket.technicienId.map(tech => tech._id.toString()),
      populatedTicket.supervisor.toString(),
      ...users.map(user => user._id.toString()),
    ];

    const adminsToNotify = admins.map(admin => admin._id.toString());

    const allRecipients = [...usersToNotify, ...adminsToNotify];

    const notifications = allRecipients.map(userId => ({
      recipient: userId,
      message: `Ticket N°: ${ticket.number} has been created from client ${populatedTicket.clientId.firstName.toUpperCase()} ${populatedTicket.clientId.lastName.toUpperCase()}.`,
      ticketId: ticket._id,
      type: "new-ticket",
    }));


    const savedNotifications = await Notification.insertMany(notifications);

    await Promise.all(
      savedNotifications.map(async notification => {
        const notificationPayload = {
          ticketId: populatedTicket,
          _id: notification._id,
          read: false,
          type: notification.type,
          message: notification.message,
        };
        try {
          await notifyUser(notification.recipient, notificationPayload, notification.type);
        } catch (err) {
          console.error(`Failed to notify user ${notification.recipient}:`, err);
        }
      })
    );
    // Sending email notifications
    const emailSubject = `New Ticket Created: ${populatedTicket.number}`;
    const emailTemplate = 'newTicket'; // Assuming there's a template named 'new-ticket.html'
    const emailVariables = {
      ticketNumber: populatedTicket.number,
      ticketTitle: populatedTicket.title,
      ticketDescription: populatedTicket.description,
      ticketCreator: `${populatedTicket.clientId.firstName} ${populatedTicket.clientId.lastName}`,
    };

    async function sendEmailsSequentially(recipients, subject, template, variables) {
      for (const recipientId of recipients) {
        const recipient = await User.findById(recipientId) || await Admin.findById(recipientId);
        if (recipient?.email) {
          try {
            await sendEmailWithTemplate(recipient.email, subject, template, variables);
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay to avoid SMTP rate limit
          } catch (err) {
            console.error(`Failed to send email to ${recipient.email}:`, err);
          }
        }
      }
    }
    res.status(200).json({ err: false, message: "Successful operation!", rows: ticket });

    setImmediate(async () => {
      await sendEmailsSequentially(usersToNotify, emailSubject, emailTemplate, emailVariables);
      await sendEmailsSequentially(adminsToNotify, emailSubject, emailTemplate, emailVariables);
    });

  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.assignTicket = async (req, res) => {
  try {
    const { _id, technicienId } = req.body;

    if (!_id || !technicienId) {
      return res.status(400).json({ err: true, message: "Missing required fields: Technicien" });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      _id,
      { technicienId },
      { new: true }
    ).populate({
      path: 'technicienId',
      model: 'Technicien',
      populate: { path: 'image', model: 'File' },
    })
      .populate({
        path: 'clientId',
        model: 'User',
        populate: { path: 'image', model: 'File' },
      });

    if (!updatedTicket) {
      return res.status(404).json({ err: true, message: "Ticket not found!" });
    }
    if (updatedTicket.status === 'Not Assigned') {
      updatedTicket.status = 'Assigned';
      updatedTicket.assignedDate = new Date();
    }

    await updatedTicket.save();

    const admins = await Admin.find({ authority: 'adminHelpdesk' });
    const usersToNotify = [
      ...updatedTicket.technicienId.map(tech => tech._id.toString()),
      ...admins.map(admin => admin._id.toString()),
    ];

    const technicianNames = updatedTicket.technicienId
      .map(tech => `${tech.firstName.toUpperCase()} ${tech.lastName.toUpperCase()}`)
      .join(', ');

    const notifications = usersToNotify.map(userId => ({
      recipient: userId,
      message: `Ticket N°: ${updatedTicket.number} has been assigned to ${technicianNames}.`,
      ticketId: updatedTicket._id,
      type: "assign-ticket",
    }));

    const savedNotifications = await Notification.insertMany(notifications);

    Promise.all(
      savedNotifications.map(async notification => {
        const notificationPayload = {
          ticketId: updatedTicket,
          _id: notification._id,
          read: false,
          type: notification.type,
          message: notification.message,
        };
        try {
          await notifyUser(notification.recipient, notificationPayload, notification.type);
        } catch (err) {
          console.error(`Failed to notify user ${notification.recipient}:`, err);
        }
      })
    );

    res.status(200).json({
      err: false,
      message: "Successful operation!",
      rows: updatedTicket,
    });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.manageTicket = async (req, res) => {
  try {
    const { _id, technicienId } = req.body;

    if (!_id || !technicienId) {
      return res.status(400).json({ err: true, message: "Missing required fields: _id or technicienId" });
    }

    let updatedTicket = await Ticket.findByIdAndUpdate(
      _id,
      {
        status: "In Progress",
        takenDate: Date.now()
      },
      { new: true }
    ).populate({
      path: "technicienId",
      model: "Technicien",
      populate: { path: "image", model: "File" },
    });

    if (!updatedTicket) {
      return res.status(404).json({ err: true, message: "Ticket not found!" });
    }

    const clientModel = updatedTicket.isHelpdesk ? "helpdeskClient" : "User";

    updatedTicket = await Ticket.findById(updatedTicket._id).populate({
      path: "clientId",
      model: clientModel,
      populate: { path: "image", model: "File" },
    });

    const technician = await Technicien.findById(technicienId);
    const admins = await Admin.find({ authority: "admin" });
    const users = await User.find({ authority: { $in: ['pmo', 'assistant'] } });

    // Adjust the notification recipients based on isHelpdesk
    let usersToNotify = [
      ...admins.map((admin) => admin._id.toString()),
      ...users.map((user) => user._id.toString()),
    ];

    if (!updatedTicket.isHelpdesk) {
      const teamLeaderId = (await Contract.findById(updatedTicket.contractId)).technicians.find(t => t.teamLeader).technician;
      usersToNotify.push(updatedTicket.clientId._id.toString());
      usersToNotify.push(teamLeaderId.toString());
    } else if (updatedTicket.isHelpdesk) {
      usersToNotify.push(updatedTicket.supervisor._id.toString());
    }

    const notifications = usersToNotify.map((userId) => {
      const notificationMessage = `Technician ${(technician.firstName).toUpperCase()} ${(technician.lastName).toUpperCase()} is now working on ticket N°: ${updatedTicket.number}. Please check for updates or further actions.`;

      return new Notification({
        recipient: userId,
        message: notificationMessage,
        ticketId: updatedTicket._id,
        type: "taken-ticket",
      });
    });

    const savedNotifications = await Notification.insertMany(notifications);
    savedNotifications.forEach((notification) => {
      const notificationPayload = {
        ticketId: updatedTicket,
        technicienId: technician._id,
        _id: notification._id,
        read: false,
        type: notification.type,
        message: notification.message,
      };
      notifyUser(notification.recipient, notificationPayload, notification.type);
    });

    res.status(200).json({
      err: false,
      message: "Successful operation!",
      rows: updatedTicket,
    });
  } catch (error) {
    console.error("Error in manageTicket:", error);
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.holdTicket = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ err: true, message: "Missing required fields: _id" });
    }

    let updatedTicket = await Ticket.findByIdAndUpdate(
      _id,
      { status: "On Hold" },
      { new: true }
    ).populate({
      path: "technicienId",
      model: "Technicien",
      populate: { path: "image", model: "File" },
    });

    if (!updatedTicket) {
      return res.status(404).json({ err: true, message: "Ticket not found!" });
    }

    res.status(200).json({
      err: false,
      message: "Successful operation!",
      rows: updatedTicket,
    });
  } catch (error) {
    console.error("Error in manageTicket:", error);
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.resumeTicket = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ err: true, message: "Missing required fields: _id" });
    }

    let updatedTicket = await Ticket.findByIdAndUpdate(
      _id,
      { status: "In Progress" },
      { new: true }
    ).populate({
      path: "technicienId",
      model: "Technicien",
      populate: { path: "image", model: "File" },
    });

    if (!updatedTicket) {
      return res.status(404).json({ err: true, message: "Ticket not found!" });
    }

    res.status(200).json({
      err: false,
      message: "Successful operation!",
      rows: updatedTicket,
    });
  } catch (error) {
    console.error("Error in manageTicket:", error);
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.saveSolution = async (req, res) => {
  try {
    const { ticketId, solution, technician } = req.body;
    const ticket = await Ticket.findById(ticketId).populate({
      path: 'technicienId',
      model: 'User',
      populate: { path: 'image', model: 'File' },
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    let existingSolution;

    if (ticket.solution) {
      // Update existing solution
      existingSolution = await Solution.findOneAndUpdate(
        { _id: ticket.solution },
        { solution, proposedPar: technician, attachments: [] }, // Clear previous attachments
        { new: true }
      );
    } else {
      // Create a new solution
      existingSolution = new Solution({
        solution,
        proposedPar: technician,
        attachments: []
      });
      await existingSolution.save();
      ticket.solution = existingSolution._id;
    }

    ticket.status = 'Resolved';
    ticket.resolvedDate = new Date();

    // Handle multiple file uploads (Replacing old files)
    const files = req.files || [];
    const uploadedFiles = [];

    for (const file of files) {
      const newFile = new File({
        fileName: file.filename,
        path: `${SERVER_URL}${file.destination}/${file.filename}`,
        title: file.originalname
      });

      await newFile.save();
      uploadedFiles.push(newFile._id);
    }

    // Overwrite old attachments with new ones
    existingSolution.attachments = uploadedFiles;

    await existingSolution.save();
    await ticket.save();

    const clientModel = ticket.isHelpdesk ? "helpdeskClient" : "User";
    const updatedTicket = await Ticket.findById(ticket._id).populate({
      path: "clientId",
      model: clientModel,
      populate: { path: "image", model: "File" },
    });

    const admins = await Admin.find({ authority: 'admin' });
    const users = await User.find({ authority: { $in: ['pmo', 'assistant'] } });
    const tech = await Technicien.findById(technician);
    const usersToNotify = [
      ticket.clientId.toString(),
      ...(ticket.supervisor ? [ticket.supervisor.toString()] : []),
      ...users.map(user => user._id.toString()),
    ];

    const adminsToNotify = admins.map(admin => admin._id.toString());
    const allRecipients = [...usersToNotify, ...adminsToNotify];

    const notificationMessage = `The technician ${tech.firstName.toUpperCase()} ${tech.lastName.toUpperCase()} has resolved ticket N°: ${ticket.number}.`;

    const notifications = allRecipients.map(userId => new Notification({
      recipient: userId,
      message: notificationMessage,
      ticketId: ticket._id,
      type: "resolved-ticket",
    }));

    const savedNotifications = await Notification.insertMany(notifications);

    savedNotifications.forEach(notification => {
      const notificationPayload = {
        ticketId: updatedTicket,
        technicienId: tech._id,
        _id: notification._id,
        read: false,
        message: notificationMessage,
        type: "resolved-ticket",
      };
      notifyUser(notification.recipient, notificationPayload, 'resolved-ticket');
    });

    const emailSubject = `Ticket Resolved: ${ticket.number}`;
    const emailTemplate = 'resolvedTicket';
    const emailVariables = {
      ticketNumber: ticket.number,
      ticketTitle: ticket.title,
      technician: `${tech.firstName} ${tech.lastName}`,
      resolutionSummary: existingSolution.solution,
      ticketClient: `${ticket.clientId.firstName} ${ticket.clientId.lastName}`,

    };

    async function sendEmailsSequentially(recipients, subject, template, variables) {
      for (const recipientId of recipients) {
        const recipient = await User.findById(recipientId) || await Admin.findById(recipientId);
        if (recipient?.email) {
          try {
            await sendEmailWithTemplate(recipient.email, subject, template, variables);
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay to avoid SMTP rate limit
          } catch (err) {
            console.error(`Failed to send email to ${recipient.email}:`, err);
          }
        }
      }
    }

    const populatedSolution = await Solution.findById(existingSolution._id)
      .populate({ path: 'attachments', model: 'File' })
      .populate({ path: 'proposedPar', model: 'Technicien', populate: { path: 'image', model: 'File' } });

    res.status(200).json({
      message: 'Solution updated successfully',
      solution: populatedSolution
    });

    setImmediate(async () => {
      await sendEmailsSequentially(usersToNotify, emailSubject, emailTemplate, emailVariables);
      await sendEmailsSequentially(adminsToNotify, emailSubject, emailTemplate, emailVariables);
    });

  } catch (error) {
    console.error('Error in updating solution:', error);
    res.status(500).json({ message: 'Error in updating solution', error });
  }
};

exports.declineSolution = async (req, res) => {
  try {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId)
      .populate('solution')
      .populate('clientId')
      .populate({
        path: 'technicienId',
        model: 'User',
        populate: { path: 'image', model: 'File' },
      });
    ticket.status = 'In Progress';
    await ticket.save();
    const clientModel = ticket.isHelpdesk ? "helpdeskClient" : "User";
    const updatedTicket = await Ticket.findById(ticket._id).populate({
      path: "clientId",
      model: clientModel,
      populate: { path: "image", model: "File" },
    });
    const solutionUpdated = await Solution.findByIdAndUpdate(
      ticket.solution._id,
      { solution: '' },
      { new: true } // to return the updated document instead of the old one
    ).populate({
      path: 'attachments',
      model: 'File', // Ensure attachments reference the correct model
    });

    const admins = await Admin.find({ authority: 'admin' });
    const usersToNotify = [
      ...ticket.technicienId.map(tech => tech._id.toString()),
      ...admins.map(admin => admin._id.toString()),
    ];
    if (!updatedTicket.isHelpdesk) {
      const teamLeaderId = (await Contract.findById(updatedTicket.contractId)).technicians.find(t => t.teamLeader).technician;
      usersToNotify.push(teamLeaderId.toString());
    } else if (updatedTicket.isHelpdesk) {
      usersToNotify.push(updatedTicket.supervisor._id.toString());
    }
    const notificationMessage = `The Client ${(updatedTicket.clientId.firstName).toUpperCase()} ${(updatedTicket.clientId.lastName).toUpperCase()} has declined the solution for ticket N°: ${ticket.number}.`;

    const notifications = usersToNotify.map(userId => {
      return new Notification({
        recipient: userId,
        message: notificationMessage,
        ticketId: ticket,
        type: "closed-ticket",
      });
    });
    const savedNotifications = await Notification.insertMany(notifications);

    savedNotifications.forEach(notification => {
      const notificationPayload = {
        ticketId: updatedTicket,
        technicienId: ticket.technicienId.map(tech => tech._id),
        _id: notification._id,
        read: false,
        message: notificationMessage,
        type: "closed-ticket",
      };
      notifyUser(notification.recipient, notificationPayload, 'closed-ticket');
    });
    res.status(200).json({ err: false, message: "Successful operation!", rows: solutionUpdated });
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.validateSolution = async (req, res) => {
  try {
    const { ticketId } = req.body;

    const ticket = await Ticket.findById(ticketId)
      .populate('solution')
      .populate('clientId')
      .populate({
        path: 'technicienId',
        model: 'User',
        populate: { path: 'image', model: 'File' },
      });
    ticket.status = 'Closed';
    ticket.closedDate = new Date();
    await ticket.save();
    const clientModel = ticket.isHelpdesk ? "helpdeskClient" : "User";
    const updatedTicket = await Ticket.findById(ticket._id).populate({
      path: "clientId",
      model: clientModel,
      populate: { path: "image", model: "File" },
    });
    const solutionUpdated = await Solution.findByIdAndUpdate(
      ticket.solution._id,
      { valid: true },
      { new: true } // to return the updated document instead of the old one
    ).populate({
      path: 'attachments',
      model: 'File', // Ensure attachments reference the correct model
    });

    const admins = await Admin.find({ authority: 'admin' });
    const usersToNotify = [
      ...ticket.technicienId.map(tech => tech._id.toString()),
      ...admins.map(admin => admin._id.toString()),
    ];
    if (!updatedTicket.isHelpdesk) {
      const teamLeaderId = (await Contract.findById(updatedTicket.contractId)).technicians.find(t => t.teamLeader).technician;
      usersToNotify.push(teamLeaderId.toString());
    } else if (updatedTicket.isHelpdesk) {
      usersToNotify.push(updatedTicket.supervisor._id.toString());
    }
    const notificationMessage = `The Client ${(updatedTicket.clientId.firstName).toUpperCase()} ${(updatedTicket.clientId.lastName).toUpperCase()} has validated the solution for ticket N°: ${ticket.number}.`;

    const notifications = usersToNotify.map(userId => {
      return new Notification({
        recipient: userId,
        message: notificationMessage,
        ticketId: ticket,
        type: "closed-ticket",
      });
    });
    const savedNotifications = await Notification.insertMany(notifications);

    savedNotifications.forEach(notification => {
      const notificationPayload = {
        ticketId: updatedTicket,
        technicienId: ticket.technicienId.map(tech => tech._id),
        _id: notification._id,
        read: false,
        message: notificationMessage,
        type: "closed-ticket",
      };
      notifyUser(notification.recipient, notificationPayload, 'closed-ticket');
    });
    res.status(200).json({ err: false, message: "Successful operation!", rows: solutionUpdated });
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.updateTicketHelpdesk = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({ err: true, message: "Ticket ID is required" });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      _id,
      { $set: req.body }, // Directly use req.body to update
      { new: true, runValidators: true }
    ).populate('listOfFiles');

    if (!updatedTicket) {
      return res.status(404).json({ err: true, message: "No ticket found or update failed" });
    }

    if (req.files && req.files.length > 0) {
      const uploadedFiles = await Promise.all(
        req.files.map(async (file) => {
          const newFile = new File({
            fileName: file.filename,
            path: `${SERVER_URL}${file.destination}/${file.filename}`,
            title: file.originalname,
          });
          await newFile.save();
          return newFile;
        })
      );

      updatedTicket.listOfFiles.push(...uploadedFiles);
      await updatedTicket.save();
    }

    res.status(200).json({ err: false, message: "Successful operation!", rows: updatedTicket });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const { _id, title, description, equipment, clientId } = req.body;

    const hardEquipment = await Equipment.findById(equipment);
    const softEquipment = await EquipmentSoft.findById(equipment);
    const site = await Site.findOne({
      $or: [
        { listEquipment: equipment },
        { listEquipmentSoft: equipment },
      ],
    });
    if (!site) {
      return res.status(400).json({ err: true, message: "Invalid equipment ID or site not found" });
    }
    const siteId = site._id;
    const updateFields = { title, description, siteId, clientId };

    if (hardEquipment) {
      updateFields.equipmentHardId = equipment;
      delete updateFields.equipmentSoftId;
    } else if (softEquipment) {
      updateFields.equipmentSoftId = equipment;
      delete updateFields.equipmentHardId;
    } else {
      return res.status(400).json({ err: true, message: "Invalid equipment ID" });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      { _id },
      { $set: updateFields }, // Only set fields explicitly defined in `updateFields`
      { new: true, runValidators: true } // Ensures validation runs on update
    ).populate('listOfFiles');

    if (!updatedTicket) {
      return res.status(404).json({ err: true, message: "No ticket found or update failed" });
    }

    if (req.files) {
      const files = req.files;
      const uploadedFiles = [];
      for (const file of files) {
        const newFile = new File({
          fileName: file.filename,
          path: `${SERVER_URL}${file.destination}/${file.filename}`,
          title: file.originalname,
        });
        await newFile.save();
        uploadedFiles.push(newFile);
      }

      updatedTicket.listOfFiles.push(...uploadedFiles);
      await updatedTicket.save();
    }

    res.status(200).json({ err: false, message: "Successful operation!", rows: updatedTicket });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.getAllTicketByClientManager = async (req, res) => {
  const clientId = req.params.clientId;
  const contract = await Contract.findOne({ clients: clientId })
  try {
    const tickets = await Ticket.find({ contractId: contract._id })
      .sort({ creationDate: -1 })
      .populate('siteId')
      .populate('rapportId')
      .populate('contractId')
      .populate([
        {
          path: 'clientId',
          model: 'User',
          populate: { path: 'image', model: 'File' },
        },
      ])
      .populate('listOfFiles')
      .populate({
        path: 'equipmentHardId',
        model: 'Equipment',
        populate: { path: 'TypeSupport.type', model: 'TypeSupport' },
      })
      .populate({
        path: 'equipmentSoftId',
        model: 'Equipment',
        populate: { path: 'TypeSupport.type', model: 'TypeSupport' },
      })
      .populate([
        {
          path: 'technicienId',
          model: 'Technicien',
          populate: { path: 'image', model: 'File' },
        },
      ]);

    res.status(200).json({ err: false, message: "Successful operation!", rows: tickets });

  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.getAllTicketByClient = async (req, res) => {
  const clientId = req.params.clientId;
  try {
    const tickets = await Ticket.find({ clientId })
      .sort({ creationDate: -1 })
      .populate('siteId')
      .populate('rapportId')
      .populate('contractId')
      .populate([
        {
          path: 'clientId',
          model: 'User',
          populate: { path: 'image', model: 'File' },
        },
      ])
      .populate('listOfFiles')
      .populate({
        path: 'equipmentHardId',
        model: 'Equipment',
        populate: { path: 'TypeSupport.type', model: 'TypeSupport' },
      })
      .populate({
        path: 'equipmentSoftId',
        model: 'EquipmentSoft',
        populate: { path: 'TypeSupport.type', model: 'TypeSupport' },
      })
      .populate([
        {
          path: 'technicienId',
          model: 'Technicien',
          populate: { path: 'image', model: 'File' },
        },
      ]);

    res.status(200).json({ err: false, message: "Successful operation!", rows: tickets });

  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.getAllTicketByTech = async (req, res) => {
  const techId = req.params.techId;
  try {
    const contracts = await Contract.find({ 'technicians.technician': techId });
    let ticketQuery = [];

    contracts.forEach(contract => {
      const technicianData = contract.technicians.find(t => t.technician.toString() === techId);

      if (technicianData?.teamLeader) {
        ticketQuery.push({ contractId: contract._id });
      } else {
        ticketQuery.push({ contractId: contract._id, technicienId: techId });
      }
    });
    ticketQuery.push({ isHelpdesk: true, technicienId: techId });
    ticketQuery.push({ isHelpdesk: true, supervisor: techId });

    const tickets = await Ticket.find({ $or: ticketQuery })
      .sort({ creationDate: -1 })
      .populate('siteId')
      .populate('rapportId')
      .populate('contractId')
      .populate('listOfFiles')
      .populate({
        path: 'equipmentHardId',
        model: 'Equipment',
        populate: { path: 'TypeSupport.type', model: 'TypeSupport' },
      })
      .populate({
        path: 'equipmentSoftId',
        model: 'Equipment',
        populate: { path: 'TypeSupport.type', model: 'TypeSupport' },
      })
      .populate({
        path: 'technicienId',
        model: 'Technicien',
        populate: { path: 'image', model: 'File' },
      })
      .populate({
        path: 'supervisor',
        model: 'Technicien',
        populate: { path: 'image', model: 'File' },
      })
      .lean();

    for (let ticket of tickets) {
      if (ticket.clientId) {
        let clientModel = ticket.isHelpdesk ? 'helpdeskClient' : 'User';
        ticket.clientId = await mongoose.model(clientModel).findById(ticket.clientId).populate('image');
      }
    }

    const updatedTickets = tickets.map(ticket => {
      const contract = contracts.find(c => c._id.toString() === ticket.contractId?._id.toString());
      const technicianData = contract?.technicians.find(t => t.technician.toString() === techId);
      return {
        ...ticket,
        isTeamLeader: technicianData?.teamLeader || false, // New variable indicating if technician is a team leader in the contract
      };
    });

    res.status(200).json({ err: false, message: "Successful operation!", rows: updatedTickets });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getAllTicketByContract = async (req, res) => {
  const contractId = req.params.contractId;
  try {
    const tickets = await Ticket.find({ contractId })
      .sort({ creationDate: -1 })
      .populate('siteId')
      .populate('contractId')
      .populate('listOfFiles')
      .populate('rapportId')
      .populate([
        {
          path: 'clientId',
          model: 'Client',
          populate: { path: 'image', model: 'File' },
        },])
      .populate({
        path: 'equipmentHardId',
        model: 'Equipment',
        populate: { path: 'TypeSupport.type', model: 'TypeSupport' },
      })
      .populate({
        path: 'equipmentSoftId',
        model: 'EquipmentSoft',
        populate: { path: 'TypeSupport.type', model: 'TypeSupport' },
      })
      .populate([
        {
          path: 'technicienId',
          model: 'Technicien',
          populate: { path: 'image', model: 'File' },
        },])

    res.status(200).json({ err: false, message: "Successful operation !", rows: tickets });

  } catch (error) {
    res.status(500).json({ err: true, message: error.message });

  }
};

exports.addRapportTicket = async (req, res) => {
  try {
    const { _id, startDate, endDate, technicienId } = req.body;
    const rapport = Rapport({
      startDate: Date(startDate),
      endDate: Date(endDate),
      technicienId: technicienId
    })
    await rapport.save();
    const rapportId = rapport._id;
    const ticketUpdate = await Ticket.findByIdAndUpdate(
      { _id },
      { rapportId },
      { new: true }
    );
    res.status(200).json({ err: false, message: "Successful operation !", rows: ticketUpdate });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getSolutionForTicket = async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const ticket = await Ticket.findById(ticketId).populate('listOfFiles');
    const solutionFiles = ticket.listOfFiles.filter(file => file.tag === 'solution');
    res.status(200).json({ solutionFile: solutionFiles });
  } catch (err) {
    res.status(500).json({ err: true, message: 'Server error' });
  }
};

exports.ticketAddFile = async (req, res) => {
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
    const ticket = await Ticket.findByIdAndUpdate(
      req.body.ticketId,
      { $push: { listOfFiles: uploadedFiles } },
      { new: true }
    );
    res.status(200).json({
      err: false,
      message: "Successful operation !",
      rows: [ticket, files.map(file => file.originalname)]
    });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.ticketReservation = async (req, res) => {
  try {
    const { email, caseId } = req.body;
    if (!email.toLowerCase() || !caseId) {
      return res.status(200).json({ err: true, message: "Email and caseId are required" });
    }
    const technician = await Technicien.findOne({ email: email.toLowerCase() }).lean();
    if (!technician) {
      return res.status(200).json({ err: true, message: "Technician does not exist in OPM" });
    }
    const ticket = await Ticket.findOne({ number: caseId })
      .populate('siteId')
    const ticketWithSite = await Ticket.findOne({ number: caseId })
      .populate('siteId')
    const ticketWithClient = await Ticket.findOne({ number: caseId })
      .populate('clientId')
    const ticketExist = !!ticket;
    if (!ticket) {

      return res.status(200).json({ err: true, ticketExist, message: "Ticket does not exist, please check your case number" });
    }
    const status = ticket.status
    if (status !== 'In Progress') {
      return res.status(200).json({ err: true, status, message: "Ticket has an invalid status, please check your case number" });
    }
    const technicianExist = Array.isArray(ticket.technicienId) &&
      ticket.technicienId.some(id => id.toString() === technician._id.toString());

    if (!technicianExist) {
      return res.status(200).json({ err: true, technicianExist, message: "This ticket is not assigned to you, please check your case number" });
    }
    let siteAddress = "";
    let clientName = "";

    if (ticket.isHelpdesk) {
      const client = await HelpdeskClient.findById(ticketWithSite.clientId);
      console.log(client)
      if (ticket.interventionAdress) {
        siteAddress = ticket.interventionAdress
      } else {
        siteAddress = client?.location
      }
      clientName = client.firstName + " " + client.lastName + " " + client.company
    } else {
      siteAddress = ticketWithSite.siteId?.adress
      clientName = ticketWithClient.clientId.firstName + " " + ticketWithClient.clientId.lastName + " " + ticketWithClient.clientId.company
    }
    return res.status(200).json({
      err: false,
      message: "Successful operation!",
      technicianExist,
      ticketExist,
      status: status,
      siteAddress: siteAddress,
      clientName: clientName,
      ticketTitle: ticket.title,
      type: "OPM"
    });

  } catch (error) {
    return res.status(500).json({ err: true, message: "Internal Server Error" });
  }
};
exports.ticketRemoveFile = async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.fileId);
    if (!file) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.ticketId,
      { $pull: { listOfFiles: req.params.fileId } },
      { new: true }
    );
    res.status(200).json({ err: false, message: "Successful operation !", rows: ticket });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getAllTicketsChart = async (req, res) => {
  try {
    // Get current and last year
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    // Fetch all tickets (without populate for performance)
    const tickets = await Ticket.find({ status: { $ne: "Deleted" } }).select("creationDate");

    // Initialize data structure
    let ticketStats = {
      currentYear: Array(12).fill(0), // Index represents months (0 = Jan, 11 = Dec)
      lastYear: Array(12).fill(0),
    };

    // Process tickets
    tickets.forEach(ticket => {
      const date = new Date(ticket.creationDate);
      const month = date.getMonth(); // Get month index (0 = Jan, 11 = Dec)
      const year = date.getFullYear();

      if (year === currentYear) {
        ticketStats.currentYear[month]++; // Increment count for this month
      } else if (year === lastYear) {
        ticketStats.lastYear[month]++; // Increment count for this month
      }
    });

    // Format response for chart (e.g., ApexCharts)
    const responseData = {
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ],
      series: [
        {
          name: `Tickets ${currentYear}`,
          data: ticketStats.currentYear,
        },
        {
          name: `Tickets ${lastYear}`,
          data: ticketStats.lastYear,
        }
      ]
    };

    res.status(200).json({ err: false, message: "Success", data: responseData });

  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.getTechnicianTicketsChart = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const tickets = await Ticket.find({
      status: { $ne: "Deleted" },
      technicienId: { $exists: true, $ne: [] },
    }).select("creationDate technicienId");

    let technicianStats = {};

    tickets.forEach(ticket => {
      const date = new Date(ticket.creationDate);
      const year = date.getFullYear();

      ticket.technicienId.forEach(techId => {
        const techIdStr = techId.toString();

        if (!technicianStats[techIdStr]) {
          technicianStats[techIdStr] = { currentYear: 0, lastYear: 0 };
        }

        if (year === currentYear) {
          technicianStats[techIdStr].currentYear++;
        } else if (year === lastYear) {
          technicianStats[techIdStr].lastYear++;
        }
      });
    });

    const technicianIds = Object.keys(technicianStats);

    // Fetch technicians with full names
    let technicians = await Technicien.find(
      { _id: { $in: technicianIds } },
      "firstName lastName"
    );

    // Sort technicians alphabetically by full name
    technicians = technicians.sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    const responseData = {
      categories: technicians.map(t => `${t.firstName} ${t.lastName}`),
      series: [
        {
          name: `Tickets ${currentYear}`,
          data: technicians.map(t => technicianStats[t._id.toString()]?.currentYear || 0),
        },
        {
          name: `Tickets ${lastYear}`,
          data: technicians.map(t => technicianStats[t._id.toString()]?.lastYear || 0),
        }
      ]
    };

    res.status(200).json({ err: false, message: "Success", data: responseData });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .sort({ creationDate: -1 })
      .populate('siteId')
      .populate('equipmentHardId')
      .populate('contractId')
      .populate('listOfFiles')
      .populate('rapportId')
      .populate('clientId')
      .populate('equipmentSoftId')
      .populate({
        path: 'technicienId',
        model: 'User',
        populate: { path: 'image', model: 'File' }, // Assuming 'image' is stored in File model
      })
      .populate({
        path: 'solution',
        populate: [
          {
            path: 'proposedPar', // This is the field inside 'solution' that references 'Technicien'
            model: 'Technicien',
            populate: {
              path: 'image', // Assuming 'image' is a field inside 'Technicien' and stored in 'File' model
              model: 'File'
            }
          },
          {
            path: 'attachments', // Populate attachments inside solution
            model: 'File' // Assuming attachments are stored in the 'File' model
          }
        ]
      });

    res.status(200).json({ err: false, message: "Successful operation!", rows: tickets });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.getAllTicketsHelpdesk = async (req, res) => {
  try {
    const tickets = await Ticket.find({ isHelpdesk: true })
      .sort({ creationDate: -1 })
      .populate('listOfFiles')
      .populate('rapportId')
      .populate({
        path: 'clientId',
        model: 'helpdeskClient',
        populate: { path: 'image', model: 'File' }, // Assuming 'image' is stored in File model
      })
      .populate({
        path: 'technicienId',
        model: 'User',
        populate: { path: 'image', model: 'File' }, // Assuming 'image' is stored in File model
      })
      .populate({
        path: 'supervisor',
        model: 'User',
        populate: { path: 'image', model: 'File' }, // Assuming 'image' is stored in File model
      })
      ;

    res.status(200).json({ err: false, message: "Successful operation!", rows: tickets });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};
exports.getAllTicketsKnowloadgeBase = async (req, res) => {
  try {
    let { page = 1, limit = 6, searchTerm = '' } = req.body;
    page = parseInt(page);
    limit = parseInt(limit);

    // Base query
    const query = {
      status: 'Closed',
      solution: { $exists: true, $ne: null }
    };

    // Optional: search by title or description
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Count total documents for pagination
    const totalCount = await Ticket.countDocuments(query);

    // Fetch paginated tickets
    const tickets = await Ticket.find(query)
      .sort({ creationDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('siteId')
      .populate('contractId')
      .populate('listOfFiles')
      .populate('rapportId')
      .populate({
        path: 'equipmentHardId',
        model: 'Equipment',
        populate: { path: 'TypeSupport.type', model: 'TypeSupport' },
      })
      .populate({
        path: 'equipmentSoftId',
        model: 'EquipmentSoft',
        populate: { path: 'TypeSupport.type', model: 'TypeSupport' },
      })
      .populate({
        path: 'technicienId',
        model: 'User',
        populate: { path: 'image', model: 'File' },
      })
      .populate({
        path: 'solution',
        populate: [
          {
            path: 'proposedPar',
            model: 'Technicien',
            populate: { path: 'image', model: 'File' }
          },
          {
            path: 'attachments',
            model: 'File'
          }
        ]
      })
      .populate({
        path: "clientId",
        model: 'User', // or "helpdeskClient" depending on your logic
        populate: { path: "image", model: "File" },
      });

    res.status(200).json({
      err: false,
      message: "Successful operation!",
      rows: tickets,
      totalCount,   // total for frontend pagination
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getAllTicketsDashboard = async (req, res) => {
  try {
    const {
      userId,
      userAuthority,
      role,
      page = 1,
      limit = 50,
      searchQuery,
      filterStatus,
      filterTechnician,
      filterSupervisor,
      filterStartDate,
      filterEndDate
    } = req.body;

    const skip = (page - 1) * limit;

    let ticketsQuery = { status: { $ne: "Deleted" } };

    // ================= USER AUTHORITY FILTERS =================
    if (userAuthority === 'technician') {
      const contracts = await Contract.find().select('_id technicians');

      const techContracts = contracts.filter(c =>
        c.technicians.some(t => t.technician.toString() === userId)
      );

      const teamLeaderContracts = techContracts.filter(c =>
        c.technicians.some(
          t => t.technician.toString() === userId && t.teamLeader
        )
      );

      const teamLeaderContractIds = teamLeaderContracts.map(c => c._id);

      ticketsQuery.$or = [
        { technicienId: userId },
        ...(teamLeaderContractIds.length
          ? [{ contractId: { $in: teamLeaderContractIds } }]
          : [])
      ];
    }

    if (userAuthority === 'client') {
      if (role === 'clientManager') {
        const clientContracts = await Contract.find({ clients: userId }).select('_id');
        ticketsQuery.contractId = { $in: clientContracts.map(c => c._id) };
      }

      if (role === 'clientUser') {
        ticketsQuery.clientId = userId;
      }
    }

    // ================= FILTERS =================
    if (filterStatus) ticketsQuery.status = filterStatus;
    if (filterTechnician) ticketsQuery.technicienId = filterTechnician;
    if (filterSupervisor) ticketsQuery.supervisor = filterSupervisor;

    if (filterStartDate || filterEndDate) {
      ticketsQuery.creationDate = {};
      if (filterStartDate) ticketsQuery.creationDate.$gte = new Date(filterStartDate);
      if (filterEndDate) ticketsQuery.creationDate.$lte = new Date(filterEndDate);
    }

    if (searchQuery && searchQuery.trim()) {
      const regex = new RegExp(searchQuery, 'i');
      ticketsQuery.$or = [
        { title: regex },
        { number: regex }
      ];
    }

    // ================= GET TICKETS (NO CLIENT POPULATE) =================
    const tickets = await Ticket.find(ticketsQuery)
      .populate({
        path: 'technicienId',
        select: 'firstName lastName image',
        populate: { path: 'image', select: 'fileName' }
      })
      .sort({ creationDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // IMPORTANT

    // ================= MANUAL CONDITIONAL POPULATE =================
    const helpdeskTickets = tickets.filter(t => t.isHelpdesk && t.clientId);
    const normalTickets = tickets.filter(t => !t.isHelpdesk && t.clientId);

    const [helpdeskClients, clients] = await Promise.all([
      HelpdeskClient.find({
        _id: { $in: helpdeskTickets.map(t => t.clientId) }
      })
        .select('company image')
        .populate({ path: 'image', select: 'fileName' })
        .lean(),

      Client.find({
        _id: { $in: normalTickets.map(t => t.clientId) }
      })
        .select('company image')
        .populate({ path: 'image', select: 'fileName' })
        .lean()
    ]);

    const helpdeskMap = {};
    helpdeskClients.forEach(c => {
      helpdeskMap[c._id.toString()] = c;
    });

    const clientMap = {};
    clients.forEach(c => {
      clientMap[c._id.toString()] = c;
    });

    tickets.forEach(ticket => {
      if (!ticket.clientId) return;

      const id = ticket.clientId.toString();
      ticket.clientId = ticket.isHelpdesk
        ? helpdeskMap[id] || null
        : clientMap[id] || null;
    });

    // ================= TOTAL COUNT =================
    const totalCount = await Ticket.countDocuments(ticketsQuery);

    res.status(200).json({
      err: false,
      message: "Tickets fetched successfully",
      rows: tickets,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });

  } catch (error) {
    res.status(500).json({
      err: true,
      message: error.message
    });
  }
};

exports.getTicketSummary = async (req, res) => {
  try {
    const { userId, userAuthority, role } = req.body;

    let matchQuery = { status: { $ne: "Deleted" } };

    // ================= USER AUTHORITY FILTERS =================
    if (userAuthority === 'technician') {
      const contracts = await Contract.find().select('_id technicians');

      const techContracts = contracts.filter(c =>
        c.technicians.some(t => t.technician.toString() === userId)
      );

      const teamLeaderContracts = techContracts.filter(c =>
        c.technicians.some(t => t.technician.toString() === userId && t.teamLeader)
      );

      const teamLeaderContractIds = teamLeaderContracts.map(c => c._id);

      matchQuery.$or = [
        { technicienId: userId },
        ...(teamLeaderContractIds.length
          ? [{ contractId: { $in: teamLeaderContractIds } }]
          : [])
      ];
    }

    if (userAuthority === 'client') {
      if (role === 'clientManager') {
        const clientContracts = await Contract.find({ clients: userId }).select('_id');
        matchQuery.contractId = { $in: clientContracts.map(c => c._id) };
      }
      if (role === 'clientUser') {
        matchQuery.clientId = userId;
      }
    }

    // ================= AGGREGATION =================
    const summary = await Ticket.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          notAssigned: { $sum: { $cond: [{ $eq: [{ $size: { $ifNull: ["$technicienId", []] } }, 0] }, 1, 0] } },
          assigned: { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ["$technicienId", []] } }, 0] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
          onHold: { $sum: { $cond: [{ $eq: ["$status", "On Hold"] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] } },
        }
      }
    ]);

    res.status(200).json({
      err: false,
      message: "Ticket summary fetched successfully",
      summary: summary[0] || {
        total: 0,
        notAssigned: 0,
        assigned: 0,
        inProgress: 0,
        onHold: 0,
        resolved: 0,
        closed: 0
      }
    });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getTicketById = async (req, res) => {
  const ticketId = req.params.id;
  try {
    const ticket = await Ticket.findById(ticketId)
      .populate({
        path: 'solution',
        populate: [
          { path: 'attachments' },
          { path: 'proposedPar' } // Populate technician details
        ]
      })
      .populate('exchanges')
      .populate('request');

    if (!ticket) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    res.status(200).json({ err: false, message: "Successful operation !", rows: ticket });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const { description, id } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status: 'Deleted', description },
      { new: true }
    );
    if (!ticket) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    res.status(200).json({ err: false, message: "Successful operation !", rows: ticket });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};


exports.saveExchanges = async (req, res) => {
  try {
    const { ticketId, caseId, technician, supports, equipmentName } = req.body;
    const ticket = await Ticket.findById(ticketId)
      .populate({
        path: 'technicienId',
        model: 'User',
        populate: { path: 'image', model: 'File' },
      })
      .populate('exchanges');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const file = req.file;

    const newFile = new File({
      fileName: file.filename,
      path: `${SERVER_URL}${file.destination}/${file.filename}`,
      title: file.originalname
    });

    await newFile.save();
    ticket.exchanges = newFile._id;
    ticket.caseId = caseId;
    await ticket.save();

    let parsedSupports = [];

    try {
      parsedSupports = JSON.parse(supports); // If it's sent as JSON string (from FormData)
    } catch (e) {
      parsedSupports = supports ? [supports] : []; // Fallback if single value
    }

    for (const support of parsedSupports) {
      const newSpare = new Spare({
        ticketId,
        typeSupport: support,
        equipmentName,
        owner: technician,
        status: 'Ordred'
      });
      await newSpare.save();
    }

    res.status(200).json({
      message: 'Exchanges updated successfully',
      rows: ticket,
    });

  } catch (error) {
    console.error('error in updating Exchanges:', error);
    res.status(500).json({ message: 'Error in updating exchanges', error });
  }
};

exports.getAverageTicketTime = async (req, res) => {
  try {
    const tickets = await Ticket.find({ status: { $ne: "Deleted" } });
    const calculateTimeDifferenceInMinutes = (start, end) => {
      if (!start || !end) return 0;
      return (new Date(end) - new Date(start)) / (1000 * 60); // Difference in minutes
    };

    let resolvedTimeSum = 0, resolvedCount = 0;
    let closedTimeSum = 0, closedCount = 0;
    let assignedTimeSum = 0, assignedCount = 0;

    tickets.forEach(ticket => {
      const { status, creationDate, resolvedDate, closedDate, assignedDate } = ticket;
      if (resolvedDate) {
        resolvedTimeSum += calculateTimeDifferenceInMinutes(creationDate, resolvedDate);
        resolvedCount++;
      }
      if (closedDate) {
        closedTimeSum += calculateTimeDifferenceInMinutes(creationDate, closedDate);
        closedCount++;
      }
      if (assignedDate) {
        assignedTimeSum += calculateTimeDifferenceInMinutes(creationDate, assignedDate);
        assignedCount++;
      }
    });
    const formatTime = (timeInMinutes) => {
      if (timeInMinutes >= 1440) {
        // Convert to days, hours, and minutes if the time is greater than or equal to 1440 minutes (1 day)
        const days = Math.floor(timeInMinutes / 1440); // Get the whole number of days
        const hours = Math.floor((timeInMinutes % 1440) / 60); // Get the remaining hours after full days
        const minutes = Math.floor(timeInMinutes % 60); // Get the remaining minutes after full hours
        return `${days} d ${hours} h ${minutes} m`;
      } else if (timeInMinutes >= 60) {
        const hours = Math.floor(timeInMinutes / 60); // Get the whole number of hours
        const minutes = Math.floor(timeInMinutes % 60); // Get the remaining minutes after full hours
        return `${hours} hrs ${minutes} min`;
      } else {
        return `${timeInMinutes.toFixed(2)} min`;
      }
    };
    const resolvedAverage = resolvedCount ? resolvedTimeSum / resolvedCount : 0;
    const closedAverage = closedCount ? closedTimeSum / closedCount : 0;
    const assignedAverage = assignedCount ? assignedTimeSum / assignedCount : 0;
    const resolvedAverageFormatted = formatTime(resolvedAverage);
    const closedAverageFormatted = formatTime(closedAverage);
    const assignedAverageFormatted = formatTime(assignedAverage);

    res.status(200).json({
      err: false,
      message: "Successfully calculated averages!",
      averages: {
        resolvedAverageFormatted,
        closedAverageFormatted,
        assignedAverageFormatted,
      },
    });
  } catch (error) {
    console.error(error); // Log the full error
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.createRapportPdf = async (req, res) => {
  try {
    const { userId, ticketId, motif, tasks, startDate, endDate, startTime, endTime, followUp, typeIntervention } = req.body;
    const rapport = await Rapport.create({ motif, startDate, endDate, tasks })
    const ticket = await Ticket.findById(ticketId)
      .populate('equipmentSoftId')
      .populate('equipmentHardId')
    let client;
    if (ticket.isHelpdesk) {
      client = await HelpdeskClient.findById(ticket.clientId);
    } else {
      client = await Client.findById(ticket.clientId);
    }
    const contract = ticket.contractId ? await Contract.findOne({ _id: ticket.contractId }) : null;
    const folder = contract ? await Folder.findOne({ contractId: contract._id }) : null;
    const user = await User.findById(userId);
    const tech = await Technicien.findById(userId).populate('signature')
    const clientUser = await User.findById(ticket.clientId);

    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const formattedDate = `${day}-${month}-${year}_${hours}${minutes}${seconds}`;
    const safeTitle = ticket.title.replace(/\//g, '-').replace(/\s+/g, '');
    const filePath = path.join(__dirname, '../../pdfs', `${formattedDate}-rapport d'intervention_${safeTitle}.pdf`);
    const docurl = `${SERVER_URL}pdfs/${formattedDate}-rapport d'intervention_${safeTitle}.pdf`;
    const doc = new PDFDocument();

    const lastRapport = await Rapport.findOne().sort({ number: -1 }).exec();
    const lastNumber = lastRapport.number ? +lastRapport.number.split('-')[1] : 0;
    const newNumber = String(lastNumber + 1).padStart(5, '0');
    const currentYear = new Date().getFullYear();
    const yearShort = String(currentYear).slice(-2);
    const rapportNumber = `${yearShort}-${newNumber}`;

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(8)
      .font('Helvetica')
      .text('Siege Social: 2 Rue Apollo 11-1082 Tunis', 40, 20)
      .text('Email: prologic@prologic.com.tn', 40, 30)
      .text('Tél: 71 155 500 | Fax: 71 789 006', 40, 40)
      .text('www.prologic.com.tn', 40, 50);

    const logoPath = path.join(__dirname, '../../pdfs/logoPrologic.png');
    doc.image(logoPath, doc.page.width - 150, 20, { width: 120 });

    doc.moveDown();
    doc.font('Helvetica-Bold')
      .fontSize(25)
      .fillColor('#003799')
      .text('Rapport d\'intervention', { align: 'center' });

    doc.moveDown();
    doc.font('Helvetica')
      .fontSize(12)
      .fillColor('black')
      .text(`N°: ${rapportNumber}`, doc.page.width - 190, 100, { align: 'right' });
    doc.moveDown();

    doc.font('Helvetica')
      .fontSize(12)
      .fillColor('black');

    const drawSectionWithHeader = (headerText, yPosition, contentCallback, contentHeight = 100) => {
      const marginX = 40;
      const sectionWidth = doc.page.width - marginX * 2;
      const headerHeight = 20;

      doc
        .rect(marginX, yPosition, sectionWidth, headerHeight)
        .fillAndStroke('#003799', '#000');
      doc
        .rect(marginX, yPosition + headerHeight, sectionWidth, contentHeight)
        .stroke();
      doc
        .fontSize(14)
        .fillColor('white')
        .text(headerText, marginX + 5, yPosition + 5);

      contentCallback(doc, marginX + 5, yPosition + headerHeight + 10);
    };

    drawSectionWithHeader('Coordonnées du client:', 120, (doc, x, y) => {
      const clientDetailsY = y;
      doc.fontSize(12).fillColor('black')
        .text(`Nom du client: ${folder?.name || client?.company}`, x, clientDetailsY);
      doc.text(`Nom du contact: ${client.firstName + ' ' + client.lastName}`, x, clientDetailsY + 20);
      doc.text('Service/Département: ..............', x, clientDetailsY + 40);

      const verticalLineX = x + 250;

      doc.fontSize(12).text(`Email: ${client.email}`, verticalLineX + 50, clientDetailsY);
      doc.text(`Tel: ${client.phoneNumber}`, verticalLineX + 50, clientDetailsY + 30);
      doc.text(`Fax: ..............`, verticalLineX + 50, clientDetailsY + 50);
    });

    drawSectionWithHeader('N° Appel/Projet:', 220, (doc, x, y) => {
      doc.fontSize(12).fillColor('black').text(`Motif (cadre du projet): ${motif}`, x, y);
    }, 50);

    drawSectionWithHeader('Détail d\'intervention:', 280, (doc, x, y) => {
      doc.fontSize(12).fillColor('black')
        .text(`Date de début d'intervention: ${startDate} `, x, y, { continued: true })
        .text(`Heure:    ${startTime}`, { align: 'right' });

      const underlineY = y + 15;
      doc.moveTo(x, underlineY)
        .lineTo(doc.page.width - 40, underlineY)
        .stroke();
      const integrationChecked = typeIntervention === 'Integration' ? ' X ' : ' ';
      const assistanceChecked = typeIntervention === 'Assistance' ? ' X ' : ' ';

      doc.fontSize(12).text(`Intégration: [  ${integrationChecked}  ]       Assistance: [  ${assistanceChecked}  ]`, x, underlineY + 10, { continued: true })
        .text('Statut du contrat:  Oui [ X ]    Non [   ]', { align: 'right' });

      const travauxY = underlineY + 30;
      doc.text('Travaux effectués:', x, travauxY);
      doc.text(`${tasks}`, x, travauxY + 20);
      doc.text(`${followUp}`, x, travauxY + 90);

      const equipementY = travauxY + 140;
      const hardEquipments = ticket.equipmentHardId
        ? `${ticket.equipmentHardId.nomPice || '--'}: ${ticket.equipmentHardId.SN || '--'}`
        : '--';
      const softEquipments = ticket.equipmentSoftId
        ? `${ticket.equipmentSoftId.equipmentName || '--'}: ${ticket.equipmentSoftId.version || '--'}`
        : '--';
      const equipementText = `Equipement materiel & soft: ${hardEquipments} | ${softEquipments}`;
      doc.text(equipementText, x, equipementY);

      const equipementUnderlineY = equipementY + 20;
      doc.moveTo(x, equipementUnderlineY)
        .lineTo(doc.page.width - 40, equipementUnderlineY)
        .stroke();

      const dateFinY = equipementUnderlineY + 15;
      doc.text(`Date de fin d'intervention:  ${endDate}`, x, dateFinY, { continued: true })
        .text(`Heure:    ${endTime}`, { align: 'right' });

      const dateFinUnderlineY = dateFinY + 15;
      doc.moveTo(x, dateFinUnderlineY)
        .lineTo(doc.page.width - 40, dateFinUnderlineY)
        .stroke();

      const suiviY = dateFinUnderlineY + 10;
      doc.text('Suivi à faire:', x, suiviY);

      const clientY = suiviY + 20;
      doc.text('Par le client: ................', x, clientY);

      const prestataireY = clientY + 20;
      doc.text('Par le prestataire: ..................', x, prestataireY);

      const finalUnderlineY = prestataireY + 20;
      doc.moveTo(x, finalUnderlineY)
        .lineTo(doc.page.width - 40, finalUnderlineY)
        .stroke();

      const midX = (doc.page.width / 2) - 20;
      const verticalLineEndY = finalUnderlineY + 150;

      doc.moveTo(midX, finalUnderlineY)
        .lineTo(midX, verticalLineEndY)
        .stroke();

      const leftTextY = finalUnderlineY + 10;
      doc.text(`Nom et signature du prestataire:`, x, leftTextY);
      doc.text(`${user.firstName + ' ' + user.lastName}`, x, leftTextY + 20);
      const signaturePath = path.join(__dirname, `../../uploads/${tech.signature.fileName}`);
      doc.image(signaturePath, x + 20, leftTextY + 40, {
        width: 120,
        height: 70,
        fit: [120, 70], // Ensures it stays within bounds
        align: 'center',
      });

      const rightTextX = midX + 10;
      const rightTextY = leftTextY;

      doc.text('Intervention:     à suivre [   ]    terminée [   ]', rightTextX, rightTextY);

      const observationY = rightTextY + 20;
      doc.text(`Observation: ...........`, rightTextX, observationY);

      const nomSignatureY = observationY + 30;
      doc.text(`Nom, signature et cachet du client:`, rightTextX, nomSignatureY)
      doc.text(`${client.firstName + ' ' + client.lastName}`, rightTextX, nomSignatureY + 20)

    }, 470);

    doc.end();
    rapport.path = docurl;
    rapport.number = rapportNumber;
    rapport.title = `${formattedDate}-rapport d'intervention_${safeTitle}.pdf`
    ticket.rapportId.push(rapport._id);
    await rapport.save();
    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'PDF generated successfully',
      filePath: filePath,
      docurl: docurl,
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message,
    });
  }
};


exports.deleteRapport = async (req, res) => {
  try {
    const rapport = await Rapport.findByIdAndDelete(req.body._id);
    if (!rapport) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    res.status(200).json({ err: false, message: "Successful operation !", rows: rapport });
  } catch (err) {
    res.status(500).json({ err: true, message: error.message });
  }
};








