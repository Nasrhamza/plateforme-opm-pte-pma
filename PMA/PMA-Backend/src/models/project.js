const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    Projectname: { type: String, required: true },
    description: { type: String },
    status: { type: String, default: "Pending" },
    TeamLeader: { type: mongoose.Types.ObjectId, ref: "User" },
    teamLeaderNote: { type: Number, default : 0 },
    dateFin: { type: Date },
    type: { type: String },
    dateDebut: { type: Date, default: Date.now() },

    client: { type: mongoose.Types.ObjectId, ref: "User" },
    equipe: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    note_Client: { type: Number, default: 0 },
    priority: { type: String, default: "Low" },
    note_Admin: { type: Number, default: 0 },
    progress: { type: Number, default: 0, },
    closedAt: { type: Date },

    requiredRatingFiles: [{ type: String }],
    providedRequiedFiles : { type : Number, default : 0 },
    hasFilesRatingConfig : { type : Boolean, default : false },

    rating : { type: mongoose.Types.ObjectId, ref: "ProjectRating" },
    finalRating : { type : Number, default : 0 },
    letterUploaded : { type : Boolean, default : false }
},
{
    timestamps : true
});

module.exports = mongoose.model("Project", ProjectSchema);