const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String }, //category can be Work , travel ,personal ,Important,freinds
    details: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    className: { type: String },
    color: { type: String },
    user: { type: mongoose.Types.ObjectId, ref: "User" }
},
{
    timestamps : true
});

module.exports = mongoose.model("Event", EventSchema);