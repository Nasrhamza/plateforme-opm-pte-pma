const mongoose = require("mongoose");
const ExperienceSchema = mongoose.Schema({
    cv :{type: mongoose.Schema.Types.ObjectId, ref: "Cv" },
    company:{type:String,required:true},
    job:{type:String,required:true},
    task_description:{type:String,required:true},
    start:{type:Date,required:true},
    end:{type:Date},
    present:{type:Boolean},
});

module.exports = mongoose.model("Experience", ExperienceSchema);