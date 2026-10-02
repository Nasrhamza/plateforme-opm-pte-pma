require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/config/db');
const { refreshJobs } = require('./src/services/scheduler');

const PORT = process.env.PORT || 3004;

connectDB().then(() => {
  refreshJobs().catch((e) => console.warn('Scheduler refresh failed', e.message));
  app.listen(PORT, () => {
    console.log(`Reporting backend running on http://localhost:${PORT}`);
  });
});
