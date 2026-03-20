const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay order
// @route   POST /api/orders/create-razorpay-order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: 'order_' + Date.now()
    };

    const order = await razorpay.orders.create(options);

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating Razorpay order' });
  }
};

// @desc    Create new order
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentId, razorpayOrderId, paymentSignature } = req.body;
    const userId = req.user.id;

    // Verify payment signature (in production)
    const body = razorpayOrderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== paymentSignature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Create order
    const order = await Order.create({
      user: userId,
      items,
      totalAmount,
      paymentId,
      razorpayOrderId,
      paymentStatus: 'completed',
      status: 'order received'
    });

    // Update inventory
    await updateInventoryStock(items);

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.base items.sauce items.cheese items.veggies items.meats')
      .sort('-createdAt');
    
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.base items.sauce items.cheese items.veggies items.meats')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to update inventory stock
const updateInventoryStock = async (items) => {
  for (const item of items) {
    // Update base stock
    if (item.base) {
      await Inventory.findByIdAndUpdate(item.base, {
        $inc: { stock: -item.quantity }
      });
    }

    // Update sauce stock
    if (item.sauce) {
      await Inventory.findByIdAndUpdate(item.sauce, {
        $inc: { stock: -item.quantity }
      });
    }

    // Update cheese stock
    if (item.cheese) {
      await Inventory.findByIdAndUpdate(item.cheese, {
        $inc: { stock: -item.quantity }
      });
    }

    // Update veggies stock
    for (const veggie of item.veggies) {
      await Inventory.findByIdAndUpdate(veggie, {
        $inc: { stock: -item.quantity }
      });
    }

    // Update meats stock
    for (const meat of item.meats) {
      await Inventory.findByIdAndUpdate(meat, {
        $inc: { stock: -item.quantity }
      });
    }
  }
};