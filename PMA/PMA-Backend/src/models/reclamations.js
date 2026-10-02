const mongoose = require("mongoose");

const ReclamationSchema = new mongoose.Schema({
    Title: { type: String, required: true },
    CodeRec: { type: String },
    Comment: { type: String, required: true },
    reponse: { type: String, default: "Waiting for response" },
    Type_Reclamation: { type: String, required: true },
    Addeddate: { type: Date, default : new Date() },
    client: { type: mongoose.Types.ObjectId, ref: "User" },
    project: { type: mongoose.Types.ObjectId, ref: "Project" },
    status: { type: String, default: "Pending" }
},
{
    timestamps : true
});
module.exports = mongoose.model("Reclamation", ReclamationSchema);