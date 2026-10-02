const Request = require("../models/requestModel");
const Solution = require("../models/solutionModel");
const Technicien = require("../models/technicienModel");
const Admin = require("../models/adminModel");
const Ticket = require('../models/ticketModel');
const Notification = require('../models/notificationModel');
const { notifyUser } = require('../../socket');
const { sendEmailWithTemplate } = require('./emailController');



exports.get3TopTechnicians = async (req, res) => {
    try {
        // Step 1: Aggregate solutions per technician
        const topTechniciansData = await Ticket.aggregate([
            {
                $match: {
                    internalTask: { $ne: true }, // exclude internal tasks (missing or false is fine)
                    solution: { $ne: null } // only where solution exists
                }
            },
            {
                $lookup: {
                    from: 'solutions',
                    localField: 'solution',
                    foreignField: '_id',
                    as: 'solutionData'
                }
            },
            { $unwind: '$solutionData' },
            {
                $match: {
                    'solutionData.proposedPar': { $ne: null }
                }
            },
            {
                $group: {
                    _id: '$solutionData.proposedPar',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        if (topTechniciansData.length === 0) {
            return res.status(200).json({ rows: [] });
        }
        // Step 2: Get exactly the top 3 technicians (handle ties properly)
        let topCandidates = [];
        let uniqueCounts = new Set();
        for (const item of topTechniciansData) {
            if (topCandidates.length >= 3 && !uniqueCounts.has(item.count)) break;
            topCandidates.push(item);
            uniqueCounts.add(item.count);
        }
        // Step 3: Extract technician IDs
        const technicianIds = topCandidates.map(item => item._id);
        // Step 4: Fetch "In Progress" ticket counts for each technician
        const ticketCounts = await Ticket.aggregate([
            {
                $match: {
                    technicienId: { $in: technicianIds },
                    status: "In Progress"
                }
            },
            { $unwind: "$technicienId" }, // Unwind to count tickets for each technician separately
            {
                $match: {
                    technicienId: { $in: technicianIds } // Ensure we only count top technicians
                }
            },
            {
                $group: {
                    _id: "$technicienId",
                    inProgressCount: { $sum: 1 } // Count tickets for each technician
                }
            }
        ]);

        // Convert ticket counts into a map for easy lookup
        const ticketCountMap = ticketCounts.reduce((acc, item) => {
            acc[item._id.toString()] = item.inProgressCount;
            return acc;
        }, {});

        // Step 5: Fetch technician details (including images)
        const technicians = await Technicien.find({ '_id': { $in: technicianIds } }).populate('image');

        // Step 6: Merge solution count, ticket count & technician details
        let finalTechnicians = topCandidates.map(item => {
            const technician = technicians.find(tech => tech._id.toString() === item._id.toString());
            const inProgressCount = ticketCountMap[item._id.toString()] || 0;

            return {
                technician: technician,
                solutionsCount: item.count,
                inProgressTickets: inProgressCount
            };
        });

        // Step 7: Sort technicians by solution count, then by "In Progress" tickets (stable sorting)
        finalTechnicians.sort((a, b) => {
            // First by solutions count (descending)
            if (a.solutionsCount !== b.solutionsCount) {
                return b.solutionsCount - a.solutionsCount;
            }
            // Then by in-progress ticket count (ascending)
            return a.inProgressTickets - b.inProgressTickets;
        });

        // Step 8: Ensure only the top 3 technicians are returned
        const top3Technicians = finalTechnicians.slice(0, 3);

        res.status(200).json({ rows: top3Technicians });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching data' });
    }
};
exports.get3TopTechniciansOnHold = async (req, res) => {
    try {
        // Step 1: Count tickets "On Hold" grouped by technician
        const onHoldData = await Ticket.aggregate([
            {
                $match: {
                    status: "On Hold",
                    internalTask: { $ne: true },
                    technicienId: { $exists: true, $ne: [] }
                }
            },
            { $unwind: "$technicienId" }, // 🔥 FIX — technicienId is array
            {
                $group: {
                    _id: "$technicienId",
                    ticketsOnHold: { $sum: 1 }
                }
            },
            { $sort: { ticketsOnHold: -1 } }
        ]);

        if (!onHoldData.length) {
            return res.status(200).json({ rows: [] });
        }

        // Handle top3 with ties
        let topCandidates = [];
        let uniqueCounts = new Set();
        for (const item of onHoldData) {
            if (topCandidates.length >= 3 && !uniqueCounts.has(item.ticketsOnHold)) break;
            topCandidates.push(item);
            uniqueCounts.add(item.ticketsOnHold);
        }

        const technicianIds = topCandidates.map(i => i._id);

        // Get total tickets per technician
        const totalTickets = await Ticket.aggregate([
            {
                $match: {
                    technicienId: { $in: technicianIds },
                    internalTask: { $ne: true }
                }
            },
            { $unwind: "$technicienId" },
            {
                $match: {
                    technicienId: { $in: technicianIds }
                }
            },
            {
                $group: {
                    _id: "$technicienId",
                    totalTickets: { $sum: 1 }
                }
            }
        ]);

        const totalTicketsMap = totalTickets.reduce((acc, item) => {
            acc[item._id.toString()] = item.totalTickets;
            return acc;
        }, {});

        // Fetch technician details
        const technicians = await Technicien.find({ _id: { $in: technicianIds } })
            .populate('image');

        const finalTechnicians = topCandidates.map(item => {
            const tech = technicians.find(t => t._id.equals(item._id));
            return {
                technician: tech,
                ticketsOnHold: item.ticketsOnHold,
                totalTickets: totalTicketsMap[item._id.toString()] || 0
            };
        });

        res.status(200).json({ rows: finalTechnicians.slice(0, 3) });

    } catch (error) {
        console.error("Error fetching top technicians with tickets on hold:", error);
        res.status(500).json({ message: "Error fetching top technicians with tickets on hold" });
    }
};


exports.requestSolution = async (req, res) => {
    try {
        const { ticketId, description, technician } = req.body;

        if (!ticketId || !description || !technician) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Find Ticket
        const ticket = await Ticket.findById(ticketId).populate({
            path: "technicienId",
            model: "User",
            populate: { path: "image", model: "File" },
        });

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Create request
        const request = await Request.create({ description, technician, ticketId });

        ticket.request = request._id;
        await ticket.save();

        // send HTTP response immediately
        res.status(201).json({
            message: "Request sent successfully",
            request,
        });

        // ===================== 📌 Background Task (No Delay to Client) =====================
        setImmediate(async () => {
            try {
                // NOTIFICATIONS (ADMINS)
                const admins = await Admin.find({ authority: "admin" });
                const adminRecipients = admins.map(ad => ad._id.toString());
                const tech = await Technicien.findById(technician);

                const notificationMessage = `A solution has been requested from technician ${tech.firstName.toUpperCase()} ${tech.lastName.toUpperCase()} for ticket N°: ${ticket.number}.`;
                const notifications = adminRecipients.map(adminId => ({
                    recipient: adminId,
                    message: notificationMessage,
                    ticketId: ticket._id,
                    type: "request-solution",
                }));

                const savedNotifications = await Notification.insertMany(notifications);

                // send socket notifications
                savedNotifications.forEach(notification => {
                    notifyUser(notification.recipient, {
                        ticketId: ticket._id,
                        technicienId: tech._id,
                        _id: notification._id,
                        read: false,
                        message: notificationMessage,
                        type: "request-solution",
                    }, "request-solution");
                });

                // EMAILS (Admins)
                const emailSubject = `Solution Requested | Ticket: ${ticket.number}`;
                const emailTemplate = "requestSolution";
                const emailVariables = {
                    ticketNumber: ticket.number,
                    ticketTitle: ticket.title,
                    technician: `${tech.firstName} ${tech.lastName}`,
                    requestDescription: description,
                };

                for (const adminId of adminRecipients) {
                    const admin = await Admin.findById(adminId);
                    if (admin?.email) {
                        await sendEmailWithTemplate(admin.email, emailSubject, emailTemplate, emailVariables);
                        await new Promise(r => setTimeout(r, 2000)); // avoid spam block
                    }
                }
            } catch (err) {
                console.error("⚠ Background job failed:", err);
            }
        });

    } catch (error) {
        console.error("Error sending solution request:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

exports.getAllRequests = async (req, res) => {
    try {

        const request = await Request.find()
            .populate('ticketId')
            .populate({
                path: 'technician',
                model: 'User',
                populate: { path: 'image', model: 'File' },
            });

        res.status(200).json({ err: false, message: "Successful operation !", rows: request });
    } catch (error) {
        res.status(500).json({ err: true, message: error.message });
    }
};

exports.validateRequest = async (req, res) => {
    try {
        const { id } = req.body;

        // 1️⃣ Update the Request
        const request = await Request.findByIdAndUpdate(
            id,
            { valid: true },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ err: true, message: 'Request not found' });
        }

        // 2️⃣ Find and update the Ticket that contains this Request
        const ticket = await Ticket.findOneAndUpdate(
            { request: id },
            { status: 'In Progress' },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ err: true, message: 'Ticket not found for this request' });
        }

        // 3️⃣ Respond with both objects
        res.status(200).json({
            err: false,
            message: 'Request validated and ticket status updated!',
            request,
            ticket
        });
    } catch (error) {
        res.status(500).json({ err: true, message: error.message });
    }
};


