const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const User = require('../models/User');

// @desc    Get all orders (Admin only)
// @route   GET /api/admin/orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.base items.sauce items.cheese items.veggies items.meats')
      .sort('-createdAt');
    
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Emit socket event for real-time update
    // This would be implemented with Socket.io
    // io.to(order.user.toString()).emit('orderStatusUpdated', order);

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get inventory items with low stock (Admin only)
// @route   GET /api/admin/low-stock
exports.getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$stock', '$threshold'] }
    });
    
    res.json(lowStockItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get dashboard statistics (Admin only)
// @route   GET /api/admin/stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'order received' });
    const inKitchenOrders = await Order.countDocuments({ status: 'in kitchen' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const lowStockItems = await Inventory.countDocuments({
      $expr: { $lte: ['$stock', '$threshold'] }
    });

    res.json({
      totalOrders,
      pendingOrders,
      inKitchenOrders,
      deliveredOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      lowStockItems
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};