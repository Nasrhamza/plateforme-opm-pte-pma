const ReportConfig = require('../models/ReportConfig');
const { runReport } = require('../services/report-runner');
const { exportReport } = require('../services/report-export');

const runOnce = async (req, res) => {
  try {
    const config = await ReportConfig.findOne({ _id: req.params.id, owner: req.user.id });
    if (!config) return res.status(404).json({ message: 'Config not found' });
    const payload = await runReport(config);
    res.json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const exportOnce = async (req, res) => {
  try {
    const config = await ReportConfig.findOne({ _id: req.params.id, owner: req.user.id });
    if (!config) return res.status(404).json({ message: 'Config not found' });
    const payload = await runReport(config);
    const format = String(req.query.format || config.schedule?.format || 'json').toLowerCase();
    const { contentType, ext, buffer } = await exportReport(payload, format);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${config.name.replace(/[^a-z0-9-_ ]/gi, '').slice(0, 40) || 'report'}.${ext}"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { runOnce, exportOnce };
