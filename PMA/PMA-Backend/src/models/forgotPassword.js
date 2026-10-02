const mongoose = require("mongoose");

const ForgetPassword = mongoose.Schema({
    email: { type: String, required: true },
    code: { type: String, required: true },
    date: { type: Date, required: true, default: new Date() },
},
{
    timestamps : true
});

module.exports = mongoose.model("forgetPassword", ForgetPassword);