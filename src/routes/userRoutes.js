const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Placeholder controller functions
const getProfile = (req, res) => {
  res.json({ message: 'Profile route working', user: req.user });
};

// Protected routes
router.get('/profile', protect, getProfile);

module.exports = router;