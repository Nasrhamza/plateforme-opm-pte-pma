const mongoose = require('mongoose');

// A saved report configuration: which KPIs to show, filters, schedule
const reportConfigSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },

  // Which data sources and KPIs are included
  kpis: [{
    source:  { type: String, enum: ['OPM', 'PTE', 'PMA'], required: true },
    metric:  { type: String, required: true }, // e.g. 'tickets_by_status'
    label:   { type: String },
  }],

  // Filter dimensions
  filters: {
    status:     [String],
    period:     { type: String, enum: ['daily', 'weekly', 'monthly', 'custom'], default: 'monthly' },
    dateFrom:   { type: Date },
    dateTo:     { type: Date },
    teams:      [String],
    clients:    [String],
    departments:[String],
  },

  // Email delivery schedule
  schedule: {
    enabled:   { type: Boolean, default: false },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    format:    { type: String, enum: ['pdf', 'xlsx', 'json'], default: 'pdf' },
    recipients:[String],
    lastSentAt:{ type: Date },
  },

  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ReportConfig', reportConfigSchema);
