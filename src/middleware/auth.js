const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  try {
    // For testing, we'll skip authentication
    // In production, you would verify the token here
    req.user = { id: 'test-user-id', role: 'user' };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

module.exports = { protect };