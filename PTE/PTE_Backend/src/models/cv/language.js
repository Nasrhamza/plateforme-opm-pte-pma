const mongoose = require("mongoose");
const LangSchema = mongoose.Schema({
    cv :{type: mongoose.Schema.Types.ObjectId, ref: "Cv" },
    name:{type:String,required:true},
    level:{type:Number,required:true},
});

module.exports = mongoose.model("Language", LangSchema);