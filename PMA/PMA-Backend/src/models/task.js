const mongoose = require("mongoose");



const TaskSchema = new mongoose.Schema({
    Title: { type: String, required: true },
    Project: { type: mongoose.Types.ObjectId, ref: "Project" },
    Details: { type: String},
    Status: { type: String, default: "Pending" }, //open or closed status
    StartDate: { type: Date, default: Date.now },
    Deadline: { type: Date },
    Executor: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    companions: [{ type: mongoose.Types.ObjectId, ref: "User" }],
   // Type: { type: String, },
    progress: { type: Number, default: 0 },
    Priority: { type: String, default: "High" },
    closedAt: { type: Date },
    ratingWeight : { type : Number, default : 0 },
    note : { type : Number, default : 0 },
    ref : { type : String, required : true }
},
{
    timestamps : true
});



module.exports = mongoose.model("Task", TaskSchema);