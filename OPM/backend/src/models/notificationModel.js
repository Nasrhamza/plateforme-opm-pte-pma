const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: [{
            type: mongoose.Schema.Types.ObjectId, // Reference to either an Admin or a User
            required: true,
        }],
        message: {
            type: String,
            required: true,
        },
        ticketId: {
            type: mongoose.Schema.Types.ObjectId, // Optional reference to the ticket
            ref: "Ticket",
            required: false,
        },
        read: {
            type: Boolean, // Whether the notification has been read
            default: false,
        },
        type: {
            type: String, // Notification type (e.g., 'new-ticket', 'assignment')
            enum: ["new-ticket", "assign-ticket", "taken-ticket", "resolved-ticket", "closed-ticket", "chat-message","request-solution"],
            required: true,
        },
    },
    { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
