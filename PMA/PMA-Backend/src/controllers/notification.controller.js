const Notification = require("../models/notification.model");
const { sendNotification } = require("../config/socket");
const { findNotifications } = require("../helpers/notifications.helpers");
const User = require("../models/user");


async function findByUser(req, res, next){
    try {
        const { notifications, total} = await findNotifications({ recepient : req.params.userId });
        res.status(200).send({ message : "notifications retrieved successfully", data : { notifications, total } })
    } catch (error) {
        next(error);
    }
}
async function manageNotification(req, res, next){
    try {
        const notification = await Notification.findById(req.params.id);
        if(!notification) throw Error("Notification not found");
        notification.status = req.body.status;
        const updated = await notification.save();
        res.status(200).send({ message : "notification updated successfully", data : { _id : updated._id, status : updated.status } })
    } catch (error) {
        next(error);
    }
}
async function realAllNotifications(req, res, next){
    try {
        if(!req.params.userId) throw Error("Oops ! an error happened");
        await Notification.updateMany(
            { recepient: req.params.userId }, // Filter condition
            { $set: { status: 'read' } }      // Update operation
        );
        return res.status(200).send({ message : "notifications updated successfully" })
    } catch (error) {
        next(error);
    }
}
async function deleteNotification(req, res, next){
    try {
        const notification = await Notification.findById(req.params.id);
        if(!notification) throw Error("Notification not found"); 
        await notification.deleteOne({ _id : notification._id });
        res.status(200).send({ message : "notification deleted successfully", data : { _id : notification._id } })
    } catch (error) {
        next(error);
    }
}

async function createAndSendNotification(title, details, recepients, entityId, entityType, emitter){
    try {
        if(!recepients || recepients.length == 0) return;
        //if recepient has amin  the nsend notif only to admins
        if(recepients.includes("admin")){
            recepients = await User.find({ roles : { $in : ["Admin"] } });
            recepients = recepients.map(u => u._id.toString());
        }
        for (let recepient of recepients) {
            const notification = await Notification.create({ title, details, recepient, entityId, entityType, emitter });
            //returns an array of notification with that filter
            const { notifications } = await findNotifications({ _id : notification._id });
            if(notifications.length > 0){
                sendNotification(notifications[0]);
            }
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    findByUser,
    manageNotification,
    deleteNotification,
    createAndSendNotification,
    realAllNotifications
}