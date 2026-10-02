const Notification = require('../models/notificationModel')

const mongoose = require("mongoose");

exports.getUserNotifications = async (req, res) => {
    const { id } = req.params;

    try {
        let notifications = await Notification.find({ recipient: id })
            .populate({
                path: "ticketId",
                populate: {
                    path: "technicienId",
                    populate: { path: "image", model: "File" },
                },
            })
            .sort({ createdAt: -1 })
            .exec();

        // Dynamically populate clientId based on isHelpdesk field
        notifications = await Promise.all(
            notifications.map(async (notification) => {
                if (notification.ticketId) {
                    const clientModel = notification.ticketId.isHelpdesk ? "helpdeskClient" : "User";
                    await notification.ticketId.populate({
                        path: "clientId",
                        model: clientModel,
                        populate: { path: "image", model: "File" },
                    });
                }
                return notification;
            })
        );

        res.status(200).json({ err: false, rows: notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ err: true, message: error.message });
    }
};


exports.markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.body;
        await Notification.updateMany({ recipient: userId }, { read: true });
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ message: 'Error marking notifications as read' });
    }
};
exports.clearAll = async (req, res) => {
    try {
        const { userId } = req.params;
        await Notification.deleteMany({ recipient: userId });
        res.status(200).json({ message: 'All notifications have been deleted' });
    } catch (error) {
        console.error('Error deleting notifications:', error);
        res.status(500).json({ message: 'Error deleting notifications' });
    }
};

exports.markOneAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;
        await Notification.findOneAndUpdate({ _id: notificationId }, { read: true });
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Error marking notification as read' });
    }
};
