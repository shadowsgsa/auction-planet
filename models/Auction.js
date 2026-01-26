const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
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
  images: [{
    type: String
  }],

  // Pricing
  startingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  reservePrice: {
    type: Number,
    default: 0
  },
  buyNowPrice: {
    type: Number,
    min: 0
  },
  bidIncrement: {
    type: Number,
    default: 1,
    min: 1
  },

  // Timing
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },

  // Inspection & Removal Periods
  inspectionPeriod: {
    start: Date,
    end: Date
  },
  removalPeriod: {
    start: Date,
    end: Date
  },

  // Seller
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'active', 'ended', 'sold', 'cancelled'],
    default: 'pending'
  },

  // Consignment Status
  consignmentStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // Winner
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

  // Item Details
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'poor'],
    default: 'good'
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },

  // Location & Shipping
  location: {
    type: String,
    trim: true
  },
  shippingAvailable: {
    type: Boolean,
    default: false
  },
  shippingCost: {
    type: Number,
    default: 0
  },

  // Fees & Commission
  listingFee: {
    type: Number,
    default: 0
  },
  listingFeePaid: {
    type: Boolean,
    default: false
  },
  commissionRate: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  },

  // Payment Status
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },

  // Completion
  auctionCompletedAt: Date,

  // Reserve Met
  reserveMet: {
    type: Boolean,
    default: false
  },

  // Featured
  isFeatured: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for searching and filtering
auctionSchema.index({ title: 'text', description: 'text' });
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ seller: 1, status: 1 });
auctionSchema.index({ category: 1, status: 1 });

// Update reserve met status
auctionSchema.pre('save', function(next) {
  if (this.reservePrice > 0) {
    this.reserveMet = this.currentPrice >= this.reservePrice;
  } else {
    this.reserveMet = true;
  }
  next();
});

module.exports = mongoose.model('Auction', auctionSchema);

