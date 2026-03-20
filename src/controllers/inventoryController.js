const Inventory = require('../models/Inventory');
const { sendStockAlert } = require('../utils/emailService');

// @desc    Get all inventory items
// @route   GET /api/inventory
exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ itemType: 1, name: 1 });
    res.json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get inventory by type
// @route   GET /api/inventory/type/:type
exports.getInventoryByType = async (req, res) => {
  try {
    const { type } = req.params;
    const inventory = await Inventory.find({ 
      itemType: type,
      isAvailable: true,
      stock: { $gt: 0 }
    });
    res.json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create inventory item (Admin only)
// @route   POST /api/inventory
exports.createInventoryItem = async (req, res) => {
  try {
    const { itemType, name, price, stock, threshold } = req.body;

    const existingItem = await Inventory.findOne({ itemType, name });
    if (existingItem) {
      return res.status(400).json({ message: 'Item already exists' });
    }

    const inventoryItem = await Inventory.create({
      itemType,
      name,
      price,
      stock,
      threshold
    });

    res.status(201).json(inventoryItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update inventory item (Admin only)
// @route   PUT /api/inventory/:id
exports.updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const inventoryItem = await Inventory.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!inventoryItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if stock is below threshold
    if (inventoryItem.stock <= inventoryItem.threshold) {
      await sendStockAlert(inventoryItem);
    }

    res.json(inventoryItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update stock after order
// @route   POST /api/inventory/update-stock
exports.updateStock = async (req, res) => {
  try {
    const { items } = req.body;
    const lowStockItems = [];

    for (const item of items) {
      // Update base stock
      if (item.base) {
        await Inventory.findByIdAndUpdate(item.base, {
          $inc: { stock: -1 }
        });
      }

      // Update sauce stock
      if (item.sauce) {
        await Inventory.findByIdAndUpdate(item.sauce, {
          $inc: { stock: -1 }
        });
      }

      // Update cheese stock
      if (item.cheese) {
        await Inventory.findByIdAndUpdate(item.cheese, {
          $inc: { stock: -1 }
        });
      }

      // Update veggies stock
      for (const veggie of item.veggies) {
        const updatedVeggie = await Inventory.findByIdAndUpdate(
          veggie,
          { $inc: { stock: -1 } },
          { new: true }
        );
        
        if (updatedVeggie && updatedVeggie.stock <= updatedVeggie.threshold) {
          lowStockItems.push(updatedVeggie);
        }
      }

      // Update meats stock
      for (const meat of item.meats) {
        const updatedMeat = await Inventory.findByIdAndUpdate(
          meat,
          { $inc: { stock: -1 } },
          { new: true }
        );
        
        if (updatedMeat && updatedMeat.stock <= updatedMeat.threshold) {
          lowStockItems.push(updatedMeat);
        }
      }
    }

    // Send alerts for low stock items
    for (const item of lowStockItems) {
      await sendStockAlert(item);
    }

    res.json({ message: 'Stock updated successfully', lowStockItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};