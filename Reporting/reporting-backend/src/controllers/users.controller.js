const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createUser = async (req, res) => {
  try {
    const { fullName, email, role = 'viewer', isEnabled = true, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'fullName, email and password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const created = await User.create({
      fullName,
      email,
      role,
      isEnabled,
      password: hashed,
    });

    const sanitized = await User.findById(created._id).select('-password');
    res.status(201).json(sanitized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAll = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const q = String(req.query.q || '').trim();
    const skip = (page - 1) * limit;

    const filter = q
      ? {
          $or: [
            { fullName: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { role: { $regex: q, $options: 'i' } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({ items, total, page, limit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    if (String(req.user.id) === String(req.params.id) && role === 'viewer') {
      return res.status(400).json({ message: 'You cannot downgrade your own admin role' });
    }

    const { fullName, role, isEnabled, password } = req.body;
    const update = {};
    if (typeof fullName === 'string') update.fullName = fullName;
    if (role === 'admin' || role === 'viewer') update.role = role;
    if (typeof isEnabled === 'boolean') update.isEnabled = isEnabled;

    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided to update' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (String(req.user.id) === String(req.params.id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const exportUsersCsv = async (req, res) => {
  try {
    const users = await User.find().select('fullName email role isEnabled createdAt').sort({ createdAt: -1 });
    const header = 'fullName,email,role,isEnabled,createdAt';
    const lines = users.map((u) =>
      [u.fullName, u.email, u.role, String(u.isEnabled), new Date(u.createdAt).toISOString()]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [header, ...lines].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="reporting-users.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createUser, getAll, updateUser, deleteUser, exportUsersCsv };
