const mongoose = require("mongoose");
const CertificationSchema = mongoose.Schema({
    cv :{type: mongoose.Schema.Types.ObjectId, ref: "Cv" },
    domaine:{type:String,required:true},
    credential:{type:String,required:true},
    date:{type:Date,required:true},
    cert_file: { type: String ,default:""},
});

module.exports = mongoose.model("Certification", CertificationSchema);