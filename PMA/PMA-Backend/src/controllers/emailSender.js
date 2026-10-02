const nodemailer = require('nodemailer');
const express = require('express')

const transporter = nodemailer.createTransport({
    service: "outlook",
    port: 587,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

module.exports.SendMail = async function(req, res) {
    const body = {...req.body }
    try {
        transporter.sendMail({
            from: process.env.EMAIL,
            to: body.to,
            subject: body.subject,
            text: body.message,

        });
        res.send('ok , mail sent');

    } catch {
        res.send('no , prb');
    }

}