const Notification = require("../models/notification.model");

async function findNotifications(filter){
    try {
        const notifications = await Notification.find(filter)
                .populate({
                    path : 'emitter',
                    select : '-password -isEnabled'
                })
                .sort({
                    createdAt : -1
                });
                const total = await Notification.countDocuments(filter);
                return { notifications, total }
    } catch (error) {
        throw Error("Error while fetching notifications")
    }
}
module.exports = {
    findNotifications
}