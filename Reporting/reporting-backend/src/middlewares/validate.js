const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateUserCreate = (req, res, next) => {
  const { fullName, email, password, role } = req.body || {};
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return res.status(400).json({ message: 'fullName must be at least 2 characters' });
  }
  if (!email || typeof email !== 'string' || !validateEmail(email)) {
    return res.status(400).json({ message: 'email must be valid' });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'password must be at least 8 characters' });
  }
  if (role && !['admin', 'viewer'].includes(role)) {
    return res.status(400).json({ message: 'role must be admin or viewer' });
  }
  next();
};

const validateUserUpdate = (req, res, next) => {
  const { fullName, role, isEnabled, password } = req.body || {};
  if (fullName !== undefined && (typeof fullName !== 'string' || fullName.trim().length < 2)) {
    return res.status(400).json({ message: 'fullName must be at least 2 characters' });
  }
  if (role !== undefined && !['admin', 'viewer'].includes(role)) {
    return res.status(400).json({ message: 'role must be admin or viewer' });
  }
  if (isEnabled !== undefined && typeof isEnabled !== 'boolean') {
    return res.status(400).json({ message: 'isEnabled must be a boolean' });
  }
  if (password !== undefined && (typeof password !== 'string' || password.length < 8)) {
    return res.status(400).json({ message: 'password must be at least 8 characters' });
  }
  next();
};

const validateReportPayload = (req, res, next) => {
  const body = req.body || {};
  if (req.method === 'POST') {
    if (!body.name || typeof body.name !== 'string') {
      return res.status(400).json({ message: 'name is required' });
    }
    if (!Array.isArray(body.kpis) || body.kpis.length === 0) {
      return res.status(400).json({ message: 'kpis must be a non-empty array' });
    }
  }
  if (body.filters?.period && !['daily', 'weekly', 'monthly', 'custom'].includes(body.filters.period)) {
    return res.status(400).json({ message: 'filters.period is invalid' });
  }
  if (body.schedule?.frequency && !['daily', 'weekly', 'monthly'].includes(body.schedule.frequency)) {
    return res.status(400).json({ message: 'schedule.frequency is invalid' });
  }
  if (body.schedule?.format && !['pdf', 'xlsx', 'json'].includes(body.schedule.format)) {
    return res.status(400).json({ message: 'schedule.format is invalid' });
  }
  next();
};

module.exports = {
  validateUserCreate,
  validateUserUpdate,
  validateReportPayload,
};
