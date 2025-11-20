const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      // Use timestamp + random suffix to avoid needing a DB count during save
      return `ORD${Date.now()}${Math.floor(Math.random() * 100000)}`;
    }
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true }
  },
  shippingAddress: {
    fullName: String,
    name: String,
    email: String,
    phone: String,
    address: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'cod', 'credit', 'upi', 'card', 'netbanking'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  tracking: {
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  recommendationSource: {
    type: String,
    enum: ['organic', 'recommendation', 'ai-assistant', 'bulk-upload'],
    default: 'organic'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate order number
orderSchema.pre('save', function(next) {
  // Ensure updatedAt is refreshed on each save. Default orderNumber is handled by the schema default.
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
