const { Chat, ChatMessage } = require('../models/chatModel');
const Ticket = require('../models/ticketModel');
const File = require('../models/fileModel');
const { SERVER_URL } = require("../config/config");
const Notification = require('../models/notificationModel');
const { notifyUser } = require('../../socket');

exports.getChatForTicket = async (req, res) => {
    try {
        const { id: ticketId } = req.params;
        const ticket = await Ticket.findById(ticketId).populate({
            path: 'chat',
            populate: [
                {
                    path: 'messages',
                    model: 'ChatMessage',
                    populate: [
                        {
                            path: 'sender',
                            model: 'User',
                            populate: {
                                path: 'image',
                                model: 'File'
                            }
                        },
                        {
                            path: 'listOfFiles',
                            model: 'File'
                        }
                    ]
                },
            ]
        });

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(200).json(ticket.chat);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching chat', error });
    }
};
exports.deleteMessageFromChat = async (req, res) => {
    try {
        const { messageId } = req.params;

        // Find the message
        const message = await ChatMessage.findById(messageId).populate('listOfFiles');
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Delete associated files
        if (message.listOfFiles.length > 0) {
            for (const file of message.listOfFiles) {
                await File.findByIdAndDelete(file._id);
            }
        }

        // Remove message from chat
        await Chat.findOneAndUpdate(
            { messages: messageId },
            { $pull: { messages: messageId } }
        );

        // Delete the message itself
        await ChatMessage.findByIdAndDelete(messageId);

        // Delete related notifications
        await Notification.deleteMany({ message: new RegExp(message.message, 'i') });

        return res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting message', error });
    }
};


exports.sendMessageToChat = async (req, res) => {
    try {
        const { id: ticketId } = req.params;
        const { senderId, message } = req.body;

        // Fetch the ticket along with client and technicians
        const ticket = await Ticket.findById(ticketId)
            .populate('clientId')
            .populate('technicienId');

        const chat = await Chat.findById(ticket.chat);

        const newMessage = new ChatMessage({
            sender: senderId,
            message: message
        });

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

            newMessage.listOfFiles.push(...uploadedFiles);
        }

        const savedMessage = await newMessage.save();
        chat.messages.push(savedMessage);
        await chat.save();

        const populatedMessage = await ChatMessage.findById(savedMessage._id)
            .populate('sender', '_id firstName lastName')
            .populate('listOfFiles');
        let usersToNotify
        if (ticket.isHelpdesk) {
            usersToNotify = [
                ...ticket.technicienId.map(tech => tech._id.toString())
            ].filter(userId => userId !== senderId.toString()); // Exclude sender

        } else
            usersToNotify = [
                ticket.clientId._id.toString(),
                ...ticket.technicienId.map(tech => tech._id.toString())
            ].filter(userId => userId !== senderId.toString()); // Exclude sender

        const notifications = usersToNotify.map(userId => {
            const notificationMessage = `New message from ${populatedMessage.sender.lastName} ${populatedMessage.sender.firstName} in ticket #${ticket.number}: "${message}".`;

            return new Notification({
                recipient: userId,
                message: notificationMessage,
                ticketId: ticket._id,
                type: "chat-message",
            });
        });

        const savedNotifications = await Notification.insertMany(notifications);

        savedNotifications.forEach(notification => {
            const notificationPayload = {
                ticketId: ticket._id,
                senderId: senderId,
                _id: notification._id,
                read: false,
                type: notification.type,
                message: notification.message,
            };
            notifyUser(notification.recipient, notificationPayload, 'chat-message');
        });

        return res.status(201).json({ message: 'Message sent successfully', data: populatedMessage });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error sending message', error });
    }
};



