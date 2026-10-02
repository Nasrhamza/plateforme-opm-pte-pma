const Spare = require('../models/spareModel');
const { SERVER_URL } = require("../config/config");
const { default: mongoose } = require('mongoose');

exports.createSpare = async (req, res) => {
    try {
        const { serialNumber, equipmentName, owner, HS, typeSupport, ticketId } = req.body;
        const existingSpare = await Spare.findOne({ serialNumber });
        if (existingSpare) {
            return res.status(400).json({ message: 'Serial number already exists.' });
        }

        const spare = new Spare({
            serialNumber,
            equipmentName,
            owner,
            HS,
            typeSupport,
            ticketId
        });

        await spare.save();

        res.status(201).json({ message: 'Spare created successfully', spare });
    } catch (error) {
        console.error('Error creating spare:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
};

exports.updateSpareTicket = async (req, res) => {
    try {
        const _id = req.params.id;
        const { serialNumber, equipmentName, status, location } = req.body;

        const updateFields = {
            serialNumber,
            equipmentName,
            status,
            location,
        };

        // Set the corresponding status date
        const now = new Date();
        if (status === 'Delivered') {
            updateFields.deliveredAt = now;
        } else if (status === 'Stocked') {
            updateFields.stockedAt = now;
        } else if (status === 'Installed') {
            updateFields.installedAt = now;
        }

        const updatedSpare = await Spare.findByIdAndUpdate(
            _id,
            updateFields,
            { new: true }
        );

        if (!updatedSpare) {
            return res.status(404).json({ err: true, message: "Spare not found." });
        }

        res.status(200).json({ err: false, message: "Successful operation!", rows: updatedSpare });
    } catch (error) {
        res.status(500).json({ err: true, message: error.message });
    }
};

exports.updateSpare = async (req, res) => {
    try {
        const _id = req.params.id
        const { serialNumber, equipmentName, owner, HS, typeSupport } = req.body;
        const existingSpare = await Spare.findOne({ serialNumber });
        if (existingSpare) {
            return res.status(400).json({ message: 'Serial number already exists.' });
        }
        const updatedSpare = await Spare.findByIdAndUpdate(
            { _id },
            { serialNumber, equipmentName, owner, HS, typeSupport },
            { new: true }
        );
        if (!updatedSpare) {
            return res.status(404).json({ err: true, message: error.message });
        }
        res.status(200).json({ err: false, message: "Successful operation !", rows: updatedSpare });
    } catch (error) {
        res.status(500).json({ err: true, message: error.message });
    }
};

exports.deleteSpare = async (req, res) => {
    try {
        const spare = await Spare.findOneAndDelete({ _id: req.body });
        if (!spare) {
            return res.status(404).json({ err: true, message: error.message });
        }
        res.status(200).json({ err: false, message: "Successful operation !", rows: spare });
    } catch (error) {
        res.status(500).json({ err: true, message: error.message });
    }
};

exports.getSparesByTicketId = async (req, res) => {
    try {
        const { id } = req.params;
        const spares = await Spare.find({ ticketId: id })
            .populate({
                path: 'ticketId',
                model: 'Ticket',
                populate: {
                    path: 'clientId',
                    model: 'User',
                    populate: {
                        path: 'image',
                        model: 'File'
                    }
                }
            })
            .populate({
                path: 'owner',
                model: 'User',
                populate: {
                    path: 'image',
                    model: 'File'
                }
            });
        res.status(200).json({ err: false, message: "Successful operation!", rows: spares });
    } catch (error) {
        res.status(500).json({ err: true, message: error.message });
    }
};

exports.getAllSpare = async (req, res) => {
    try {
        let spares = await Spare.find()
            .populate({
                path: 'ticketId',
                model: 'Ticket',
                select: 'clientId isHelpdesk number contractId',
            })
            .populate({
                path: 'owner',
                model: 'User',
                populate: { path: 'image', model: 'File' },
            })
            .lean(); // easier to modify docs

        for (const spare of spares) {
            if (spare.ticketId?.clientId) {
                const clientModel = spare.ticketId.isHelpdesk ? 'helpdeskClient' : 'User';
                const client = await mongoose.model(clientModel)
                    .findById(spare.ticketId.clientId)
                    .populate({ path: 'image', model: 'File' })
                    .lean();
                spare.ticketId.clientId = client;
            }
        }

        res.status(200).json({ err: false, message: 'Successful operation!', rows: spares });
    } catch (error) {
        res.status(500).json({ err: true, message: error.message });
    }
};
