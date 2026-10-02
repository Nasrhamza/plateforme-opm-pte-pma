const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    details: { type: String },
    recepient: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    emitter: { type: mongoose.Types.ObjectId, ref: "User" },
    status: {
        type: String,
        enum: ["unread", "read", "archived"],
        default: "unread",
    },
    entityId: { type: mongoose.Types.ObjectId },
    entityType: { 
        type: String, 
        enum: ["Task", "Project", "Reclamation", "Risk", "User", "Proces", "File"], required: true 
    },
},
{
    timestamps : true
});
module.exports = mongoose.model("Notification", NotificationSchema);