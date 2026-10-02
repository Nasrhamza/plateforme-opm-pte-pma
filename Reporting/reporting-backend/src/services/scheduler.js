const cron = require('node-cron');
const ReportConfig = require('../models/ReportConfig');
const { runReport } = require('./report-runner');
const { exportReport } = require('./report-export');
const { sendMail, isMailConfigured } = require('./mailer');

const jobs = new Map();

function cronExprForFrequency(freq) {
  // 08:00 local time
  if (freq === 'daily') return '0 8 * * *';
  if (freq === 'weekly') return '0 8 * * 1'; // Monday
  if (freq === 'monthly') return '0 8 1 * *'; // 1st
  return null;
}

async function runAndEmail(config) {
  const payload = await runReport(config);
  const format = (config.schedule?.format || 'pdf').toLowerCase();
  const { ext, buffer, contentType } = await exportReport(payload, format);

  if (!isMailConfigured()) {
    // don't fail the cron loop if email isn't configured
    return { skipped: true, reason: 'Mail not configured' };
  }

  const to = (config.schedule?.recipients || []).join(',');
  if (!to) {
    return { skipped: true, reason: 'No recipients' };
  }

  await sendMail({
    to,
    subject: `[Reporting Hub] ${config.name}`,
    text: `Automated report delivery for "${config.name}". Generated at ${payload.generatedAt}.`,
    attachments: [
      {
        filename: `${(config.name || 'report').replace(/[^a-z0-9-_ ]/gi, '').slice(0, 40)}.${ext}`,
        content: buffer,
        contentType,
      },
    ],
  });

  await ReportConfig.updateOne({ _id: config._id }, { $set: { 'schedule.lastSentAt': new Date() } });
  return { sent: true };
}

async function refreshJobs() {
  // clear previous
  for (const [, task] of jobs) task.stop();
  jobs.clear();

  const active = await ReportConfig.find({ isActive: true, 'schedule.enabled': true });
  active.forEach((cfg) => {
    const freq = cfg.schedule?.frequency;
    const expr = cronExprForFrequency(freq);
    if (!expr) return;
    const task = cron.schedule(expr, () => {
      runAndEmail(cfg).catch((e) => console.warn('Scheduled report failed', cfg._id, e.message));
    });
    jobs.set(String(cfg._id), task);
  });
}

module.exports = { refreshJobs };
