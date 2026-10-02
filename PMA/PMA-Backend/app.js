// ============imports=============
const express = require("express");
const app = express();
const cors = require("cors")
const db_connect = require("./src/config/db_connect")
const path = require('path')
const usersRoute = require("./src/routes/userRoute");
const projectRoute = require("./src/routes/projectRoute");
const reclamationRoute = require("./src/routes/reclamationRoute");
const taskRoute = require("./src/routes/taskRoute");
const eventRoute = require("./src/routes/eventRoute");
const procesRoute = require('./src/routes/procesvRoute')
const problemRoute = require('./src/routes/problemeRoute')
const authRoute = require('./src/routes/auth.route')
const filesRoute = require('./src/routes/files.route')
const ratingsRoute = require('./src/routes/ratings.route')
const error_handler = require("./src/config/error-handler")
const NotificationRoute = require("./src/routes/notification.route")
const KpisRoute = require("./src/routes/kpis.routes")
const fs = require('fs');

app.use(express.json());
app.use(cors());

db_connect();

app.use('/static/images', express.static(path.join(__dirname, './src/static/images')))
app.use('/projectsFile', express.static(path.join(__dirname, './src/uploads/projects')));

app.use(`/api/v1/auth`, authRoute);
app.use(`/api/v1/users`, usersRoute);
app.use(`/api/v1/projects`, projectRoute);
app.use(`/api/v1/reclamations`, reclamationRoute);
app.use(`/api/v1/tasks`, taskRoute);
app.use(`/api/v1/events`, eventRoute);
app.use(`/api/v1/procesV`, procesRoute);
app.use(`/api/v1/problems`, problemRoute);
app.use(`/api/v1/files`, filesRoute);
app.use(`/api/v1/ratings`, ratingsRoute);
app.use(`/api/v1/notifications`, NotificationRoute);
app.use(`/api/v1/kpis2`, KpisRoute)
app.use(`/api/v1/kpis`, KpisRoute)
//an endpoint for getting all files number
app.get('/getProjectsFilesCount', (req, res, next)=>{
    try {
        const folderPath = path.join(__dirname, './src/uploads/projects');
        fs.readdir(folderPath, (err, files) => {
            if (err) {
              return res.status(500).json({ error: 'Unable to scan directory: ' + err });
            }
            const fileCount = files.length;
            return res.status(200).json({ fileCount: fileCount, message : "files retrieved successfully" });
          });
    } catch (error) {
        next(error)
    }
})
//download file
app.get('/download/:filename', (req, res, next) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'src/uploads/projects', filename);
  
    return res.download(filePath, (err) => {
      if (err) {
        next(Error("Error while downloading file"))
      }
    });    
  } catch (error) {
    next(error)
  }
});
//global error handler
app.use(error_handler)

module.exports = app; 