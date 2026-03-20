const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    base: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory'
    },
    sauce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory'
    },
    cheese: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory'
    },
    veggies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory'
    }],
    meats: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory'
    }],
    quantity: {
      type: Number,
      default: 1
    },
    price: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['order received', 'in kitchen', 'sent to delivery', 'delivered', 'cancelled'],
    default: 'order received'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentId: String,
  razorpayOrderId: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);