const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// Placeholder controller functions
const getAllOrders = (req, res) => {
  res.json({ message: 'Get all orders route working', orders: [] });
};

const updateOrderStatus = (req, res) => {
  res.json({ message: `Update order ${req.params.id} status route working` });
};

const getLowStockItems = (req, res) => {
  res.json({ message: 'Get low stock items route working', items: [] });
};

const getDashboardStats = (req, res) => {
  res.json({ message: 'Get dashboard stats route working', stats: {} });
};

const getAllUsers = (req, res) => {
  res.json({ message: 'Get all users route working', users: [] });
};

// Routes
router.get('/orders', protect, admin, getAllOrders);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);
router.get('/low-stock', protect, admin, getLowStockItems);
router.get('/stats', protect, admin, getDashboardStats);
router.get('/users', protect, admin, getAllUsers);

module.exports = router;