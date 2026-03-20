const admin = (req, res, next) => {
  // For testing, we'll assume user is admin
  // In production, check req.user.role
  req.user = { ...req.user, role: 'admin' };
  next();
};

module.exports = { admin };