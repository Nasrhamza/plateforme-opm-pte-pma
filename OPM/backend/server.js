const http = require("http");
// const https = require("https");
const app = require("./app");
const { PORT } = require('./src/config/config');

const { initSocket } = require('./socket');  // Import the initSocket function
const fs = require("fs");

const options = {
  key: fs.readFileSync('./src/cert/prologic.key'),
  cert: fs.readFileSync('./src/cert/prolo-cert.pem')
}

const server = http.createServer(options, app);

initSocket(server);
require("./src/middlewares/crons");

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});