const ReportConfig = require('../models/ReportConfig');

const create = async (req, res) => {
  try {
    const config = await ReportConfig.create({ ...req.body, owner: req.user.id });
    res.status(201).json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 9));
    const q = String(req.query.q || '').trim();
    const skip = (page - 1) * limit;
    const base = { owner: req.user.id };
    const filter = q
      ? { ...base, name: { $regex: q, $options: 'i' } }
      : base;

    const [items, total] = await Promise.all([
      ReportConfig.find(filter).populate('owner', 'fullName email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      ReportConfig.countDocuments(filter),
    ]);
    res.json({ items, total, page, limit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const config = await ReportConfig.findOne({ _id: req.params.id, owner: req.user.id });
    if (!config) return res.status(404).json({ message: 'Config not found' });
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const config = await ReportConfig.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true }
    );
    if (!config) return res.status(404).json({ message: 'Config not found' });
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await ReportConfig.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    res.json({ message: 'Config deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { create, getAll, getOne, update, remove };
