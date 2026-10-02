const mongoose = require("mongoose");
const SkillSchema = mongoose.Schema({
    cv :{type: mongoose.Schema.Types.ObjectId, ref: "Cv" },
    name:{type:String,required:true},
    level:{type:Number,required:true},
});

module.exports = mongoose.model("Skill", SkillSchema);