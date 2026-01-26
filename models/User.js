const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },

  // Profile Information
  bio: {
    type: String,
    maxlength: 500
  },

  // Address
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },

  // User Type
  userType: {
    type: String,
    enum: ['buyer', 'seller', 'both'],
    default: 'buyer'
  },

  // Role
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },

  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },

  // Balance & Wallet
  balance: {
    type: Number,
    default: 0
  },

  // Stripe Customer ID
  stripeCustomerId: String,

  // Statistics
  totalPurchases: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalBids: {
    type: Number,
    default: 0
  },

  // Ratings (for sellers)
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },

  // Account Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned', 'deleted'],
    default: 'active'
  },

  // Last Login
  lastLogin: Date,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for searching
userSchema.index({ email: 1 });
userSchema.index({ name: 'text' });

module.exports = mongoose.model('User', userSchema);

