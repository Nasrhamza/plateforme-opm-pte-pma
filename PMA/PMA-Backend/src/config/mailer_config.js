const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars");

const { MAILING_EMAIL, MAILING_PASSWORD, MAILING_PORT, MAILING_HOST } = require("../config/config");


const transporterOptions = {
    host: MAILING_HOST,
    secure : true,
    port: MAILING_PORT,
    auth: {
        user: MAILING_EMAIL,
        pass: MAILING_PASSWORD,
    }
}

const transporter = nodemailer.createTransport(transporterOptions);

module.exports.sendMail = (to, subject, content) => {
    transporter.sendMail({
        from: MAILING_EMAIL,
        to: to,
        subject: subject,
        text: content,
    });
}


const readHTMLFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, { encoding: 'utf-8' }, (err, html) => {
            if (err) reject(err);
            else resolve(html);
        });
    });
};

module.exports.sendEmailWithTemplate = async (to, subject, templateName, variables) => {
    try {
        if(!variables){
            throw Error("Invalid details, please provide a valid variables for template");
        }
        variables.year = new Date().getFullYear();
        const templatePath = path.join(__dirname, '../templates/mail_templates', `${templateName}.html`);
        const template = await readHTMLFile(templatePath);

        handlebars.registerHelper('encodeURIComponent', function(value) {
            return encodeURIComponent(value);
          });
        const compiledTemplate = handlebars.compile(template);
        const htmlContent = compiledTemplate(variables);

        const mailOptions = {
            from: MAILING_EMAIL,
            to,
            subject : `[PMA] - ${subject}`,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}