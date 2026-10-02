const mongoose = require("mongoose");


const ProjectFileSchema = new mongoose.Schema({
    project: { type: mongoose.Types.ObjectId, ref: "Project", require : true},
    file: { type: String, required: true },
    type: { type: String, required: true },
},
{
    timestamps : true
});



module.exports = mongoose.model("ProjectFile", ProjectFileSchema);