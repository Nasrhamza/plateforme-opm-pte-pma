const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',    require('./src/routes/auth.routes'));
app.use('/api/users',   require('./src/routes/users.routes'));
app.use('/api/reports', require('./src/routes/reportConfig.routes'));
app.use('/api/data',    require('./src/routes/data.routes'));

app.get('/health', (req, res) => res.json({ status: 'ok', port: process.env.PORT }));

module.exports = app;
