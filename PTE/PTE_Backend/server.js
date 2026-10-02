const http = require("http");
// const https = require("https"); // Uncomment if using HTTPS
const app = require("./app");
const fs = require("fs");
const resetBalances = require('./src/tools/crons'); // Ensure the path is correct

// SSL options (uncomment if using HTTPS)
/*
const options = {
  key: fs.readFileSync('./src/cert/prologic.key'),
  cert: fs.readFileSync('./src/cert/prolo-cert.pem')
};
*/

// Initialize the cron job
try {
  resetBalances();
  console.log('Cron job initialized successfully.');
} catch (error) {
  console.error('Failed to initialize cron job:', error);
}

// Set the port
const port = process.env.PORT || 3001;
app.set("port", port);

// Create the server
const server = http.createServer(app); // Use this for HTTP
// const server = https.createServer(options, app); // Uncomment for HTTPS

// Start the server
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${port} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${port} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});