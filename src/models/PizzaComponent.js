const mongoose = require('mongoose');

const pizzaComponentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['base', 'sauce', 'cheese', 'veggie', 'meat'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('PizzaComponent', pizzaComponentSchema);