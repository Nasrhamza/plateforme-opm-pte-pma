const mongoose = require("mongoose");
const EducationSchema = mongoose.Schema({
    cv :{type: mongoose.Schema.Types.ObjectId, ref: "Cv" },
    establishment:{type:String,required:true},
    section:{type:String,required:true},
    diploma:{type:String,required:true},
    year_start:{type:Date,required:true},
    year_end:{type:Date},
    present:{type:Boolean},
});

module.exports = mongoose.model("Education", EducationSchema);