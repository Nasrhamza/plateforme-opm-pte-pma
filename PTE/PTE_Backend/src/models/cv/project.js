const mongoose = require("mongoose");
const ProjectSchema = mongoose.Schema({
    cv :{type: mongoose.Schema.Types.ObjectId, ref: "Cv" },
    organization:{type:String,required:true},
    title:{type:String,required:true},
    description:{type:String,required:true},
    date:{type:Date,required:true},
});

module.exports = mongoose.model("Project", ProjectSchema);