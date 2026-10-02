// ============imports=============
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const { strict } = require("assert");
require("dotenv").config();
const auth = require("./src/controllers/authController");
const cors = require('cors');
const app = express();
exports.app = app;
const moment = require('moment');
require('moment-timezone');
const { CONNECTION_STRING } = require('./src/config/config')
// ============ imporing routes ================

const authRoute = require("./src/routes/authRoute");
const helpdeskRoute = require("./src/routes/helpdeskRoute");
const chatRoute = require("./src/routes/chatRoute");
const notifRoute = require("./src/routes/notificationRoute");
const userRoute = require("./src/routes/userRoute");
const adminRoute = require("./src/routes/adminRoute");
const ticketRoute = require("./src/routes/ticketRoute");
const solutionRoute = require("./src/routes/solutionRoute");
const contractRoute = require("./src/routes/contractRoute");
const clientRoute = require("./src/routes/clientRoute");
const fileRoute = require("./src/routes/fileRoute");
const folderRoute = require("./src/routes/folderRoute");
const spareRoute = require("./src/routes/spareRoute");
const technicianRoute = require("./src/routes/technicienRoot");
const eqRoute = require("./src/routes/equipmentRoute");
const eqSoftRoute = require("./src/routes/equipmentsoftRoute");
const typesupport = require("./src/routes/typesupportRoute");
const site = require("./src/routes/siteRoute");
const fileRoutes = require("./src/routes/fileRoute");
const vistepreventiveRoute = require("./src/routes/vistepreventiveRoute");
const visteinfogeranceRoute = require("./src/routes/visiteInfogeranceRoute");
const healthCheckRoute = require("./src/routes/healthCheckRoute");

app.use(cors());
//========== configuration ============//
moment.tz.setDefault('Africa/Tunis');
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control");

  //=========== Intercept OPTIONS method=======//
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  } next();
});

//=========== connecting to database ==============
mongoose.set("strictQuery", true);
mongoose
  .connect(
    CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log("Connected to database");
  })
  .catch((err) => console.log("error has been occured: ", err));

// ========= configurring routes ==========

app.use("/auth", authRoute);
app.use("/helpdesk", helpdeskRoute);
app.use("/solution", solutionRoute);
app.use("/user", userRoute);
app.use("/chat", chatRoute);
app.use("/admin", adminRoute);
app.use("/ticket", ticketRoute);
app.use("/contract", contractRoute);
app.use('/files', fileRoutes);
app.use("/client", clientRoute);
app.use("/equipment", eqRoute);
app.use("/equipmentSoft", eqSoftRoute);
app.use("/typeSupport", typesupport);
app.use("/site", site);
app.use("/file", auth.verify, fileRoute);
app.use("/folder", folderRoute);
app.use("/spare", spareRoute);
app.use("/tech", technicianRoute);
app.use("/vistepreventive", vistepreventiveRoute);
app.use("/visteInfogerance", visteinfogeranceRoute);
app.use("/healthCheck", healthCheckRoute);
app.use("/notification", notifRoute);


// ======== exporting app ========
module.exports = app;
