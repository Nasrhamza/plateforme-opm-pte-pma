const https = require("https");
const http = require('http')
const app = require("./app");
const fs = require("fs");
const config = require("./src/config/config");
const { connectSocket } = require("./src/config/socket")

let options = {};
if(config.NODE_ENV == 'production'){
    options={
        key: fs.readFileSync('./src/cert/prologic.key'),
        cert:fs.readFileSync('./src/cert/prolo-cert.pem')
    }
}

const port = config.PORT;
app.set("port", port);
console.log(`*** ${config.NODE_ENV} ***`)
if(config.NODE_ENV == 'production'){
    const server = https.createServer(options,app);
    server.listen(port, () => console.log(`==== SERVER RUNNING ON PORT ${port}`));
    connectSocket(server);
}else{
    server = http.createServer(app);
    //connect socket for notifications
    connectSocket(server);
    server.listen(port, () => console.log(`==== SERVER RUNNING ON PORT ${port}`));
}

