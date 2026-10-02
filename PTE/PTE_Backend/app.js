// ============imports=============
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv/config");
const app = express();
// import { createServer } from "http";
// import { Server } from "socket.io";

// ============ imporing routes ================
const usersRoute = require("./src/routes/user");
const loginRoute = require("./src/routes/login");
const cvRoute = require("./src/routes/cv");

const leaveRoute = require("./src/routes/leave");

/**Material Resources Routes */
const roomRoute = require("./src/routes/material_resources/room");
const vehicleRoute = require("./src/routes/material_resources/vehicle");
const virtualizationEnvRoute = require("./src/routes/material_resources/virtualization_env");

//posts 
const postsRoute = require('./src/routes/post');
const likesRoute = require('./src/routes/like');
const commentsRoute = require('./src/routes/comment');
//inventory
const accessoryRoute = require('./src/routes/inventory/accessory');
const equipmentRoute = require('./src/routes/inventory/equipment');
const userItemRoute = require('./src/routes/inventory/user_item');
//technical team
const userEventRoute = require('./src/routes/technical_team/userEvent');

//========== configuration ============
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use((req,res,next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control");
  // intercept OPTIONS method
  if ('OPTIONS' == req.method){
    res.status(200).send();
  }
  else {
    next();
  }
})
//=========== connecting to database ==============
mongoose.set("strictQuery", true);
mongoose
  .connect(
    // "mongodb+srv://LOCAL_USER:LOCAL_PASSWORD@pte.uecwzfo.mongodb.net/PTE-db?retryWrites=true&w=majority",
    process.env.CONNECTION_STRING,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => console.log("error has been occured: ", err));
// ========= configurring routes ==========
app.use("/images", express.static(path.join("./src/static/images")));
app.use("/postImages", express.static(path.join("./src/static/postImages")));
app.use("/certFiles", express.static(path.join("./src/static/certFiles")));
app.use("/leaveCertif", express.static(path.join("./src/static/leaveCert")));
app.use("/external_docs", express.static(path.join("./src/static/external_docs")));
app.use("/signatures", express.static(path.join("./src/static/signatures")));
// app.use("/pdf", express.static(path.join("./src/uploads/plans")));

app.use("/api/users", usersRoute);
app.use("/api/login", loginRoute);
app.use("/api/cv", cvRoute);
/**Material Resources */
app.use("/api/material/room", roomRoute);
app.use("/api/material/vehicle", vehicleRoute);
app.use("/api/material/virtualization", virtualizationEnvRoute);
app.use("/api/leave", leaveRoute); 
//posts
app.use("/api/post", postsRoute);
app.use("/api/like", likesRoute);
app.use("/api/comment", commentsRoute);

app.use("/api/accessory", accessoryRoute);
app.use("/api/equipment", equipmentRoute);
// app.use("/api/user_item", userItemRoute);

app.use("/api/technical-team", userEventRoute);



// ======== exporting app ========

module.exports = app;
