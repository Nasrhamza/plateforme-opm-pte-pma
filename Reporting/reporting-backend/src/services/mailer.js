const nodemailer = require('nodemailer');

function isMailConfigured() {
  return !!(process.env.MAILING_HOST && process.env.MAILING_PORT && process.env.MAILING_EMAIL && process.env.MAILING_PASSWORD);
}

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.MAILING_HOST,
    port: Number(process.env.MAILING_PORT),
    secure: Number(process.env.MAILING_PORT) === 465,
    auth: {
      user: process.env.MAILING_EMAIL,
      pass: process.env.MAILING_PASSWORD,
    },
  });
}

async function sendMail({ to, subject, text, attachments }) {
  if (!isMailConfigured()) {
    const err = new Error('Mail not configured (MAILING_HOST/PORT/EMAIL/PASSWORD)');
    err.code = 'MAIL_NOT_CONFIGURED';
    throw err;
  }
  const transporter = getTransport();
  await transporter.sendMail({
    from: process.env.MAILING_EMAIL,
    to,
    subject,
    text,
    attachments,
  });
}

module.exports = { isMailConfigured, sendMail };
