const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

// Placeholder controller functions
const getInventory = (req, res) => {
  res.json({ message: 'Get inventory route working', inventory: [] });
};

const getInventoryByType = (req, res) => {
  res.json({ message: `Get inventory by type ${req.params.type} route working`, items: [] });
};

const createInventoryItem = (req, res) => {
  res.json({ message: 'Create inventory item route working' });
};

const updateInventoryItem = (req, res) => {
  res.json({ message: `Update inventory item ${req.params.id} route working` });
};

// Routes
router.get('/', protect, getInventory);
router.get('/type/:type', protect, getInventoryByType);
router.post('/', protect, admin, createInventoryItem);
router.put('/:id', protect, admin, updateInventoryItem);

module.exports = router;