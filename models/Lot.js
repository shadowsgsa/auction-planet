const mongoose = require('mongoose');

const lotSchema = new mongoose.Schema({
  auctionShop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionShop',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Basic Info
  lotNumber: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'poor'],
    required: true
  },
  
  // Pricing
  startingBid: {
    type: Number,
    required: true,
    min: 0
  },
  highestBid: {
    type: Number,
    default: 0
  },
  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  buyNowPrice: {
    type: Number,
    min: 0
  },
  reservePrice: {
    type: Number,
    default: 0
  },
  bidIncrement: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // Timing
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Media
  images: [{
    type: String
  }],
  
  // Logistics
  location: String,
  shippingCost: {
    type: Number,
    default: 0
  },
  shippingOption: {
    type: String,
    enum: ['shipping', 'pickup', 'both'],
    default: 'both'
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'active', 'ended', 'sold', 'cancelled'],
    default: 'pending'
  },
  
  // Winner
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Quantity
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // Statistics
  totalBids: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  
  // Payment & Delivery
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'picked-up'],
    default: 'pending'
  },
  
  // Reserve met
  reserveMet: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for searching and filtering
lotSchema.index({ title: 'text', description: 'text' });
lotSchema.index({ auctionShop: 1, status: 1 });
lotSchema.index({ status: 1, endDate: 1 });

// Update reserve met status
lotSchema.pre('save', function(next) {
  if (this.reservePrice > 0) {
    this.reserveMet = this.highestBid >= this.reservePrice;
  } else {
    this.reserveMet = true;
  }
  next();
});

module.exports = mongoose.model('Lot', lotSchema);

