const mongoose = require("mongoose");
const CvSchema = mongoose.Schema({

  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  summary: { type: String, default:"", required:false },
  education:  { type: mongoose.Schema.Types.ObjectId, ref: "Education" },
  experience: { type: mongoose.Schema.Types.ObjectId, ref: "Experience"},
  certification: { type: mongoose.Schema.Types.ObjectId, ref: "Certification" },
  projet: { type: mongoose.Schema.Types.ObjectId, ref: "Projet" },
  skill:  { type: mongoose.Schema.Types.ObjectId, ref: "Skill" },
  language:  { type: mongoose.Schema.Types.ObjectId, ref: "Language" }
});

module.exports = mongoose.model("Cv", CvSchema);
