const nodemailer = require('nodemailer');

async function emailSender(to, subject, text) {
  try {
    // Create a transporter using SMTP configuration
    const transporter = nodemailer.createTransport({
      service: "outlook",
      port: 587,
      auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });
      const mailOptions = {
      from: process.env.EMAIL,   
      to,
      subject,
      text
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

module.exports = emailSender;