require("dotenv").config();
module.exports = {
    PORT: process.env.PORT,
    CONNECTION_STRING: process.env.CONNECTION_STRING,
    API_URL: process.env.API_URL,
    MAILING_EMAIL: process.env.MAILING_EMAIL,
    MAILING_PASSWORD: process.env.MAILING_PASS,
    MAILING_HOST: process.env.MAILING_HOST,
    MAILING_PORT: process.env.MAILING_PORT,
    NODE_ENV: process.env.NODE_ENV,
    SERP_API_KEY : process.env.SERP_API_KEY
}