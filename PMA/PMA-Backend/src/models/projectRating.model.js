const mongoose = require("mongoose");

const ProjectRatingSchema = new mongoose.Schema({
    project: { type: mongoose.Types.ObjectId, ref: "Project", required : true },
    //note given by manager to team leader
    managerToTeamLeaderRating: { type: Number, default : 0 },
    //note given to members based on tasks
    membersNotes: [
        {
            member : { type : mongoose.Types.ObjectId, ref: "User" },
            note : { type : Number, default : 0 }
        }
    ],
    //note given to team leader by members
    memberToTeamLeaderRatings: [
        {
            member : { type : mongoose.Types.ObjectId, ref: "User" },
            note : { type : Number, default : 0 }
        }
    ],
},
{
    timestamps : true
});
module.exports = mongoose.model("ProjectRating", ProjectRatingSchema);