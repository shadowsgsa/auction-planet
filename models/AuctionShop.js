const mongoose = require('mongoose');

const auctionShopSchema = new mongoose.Schema({
  shopOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Shop Address
  shopAddress: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    zip: String,
    country: { type: String, default: 'USA' }
  },
  
  // Shipping Contact
  shippingContact: {
    name: String,
    phone: String
  },
  
  // Shipping Options (prices)
  shippingOptions: {
    standard: { type: Number, default: 0 },
    expedited: { type: Number, default: 0 },
    overnight: { type: Number, default: 0 }
  },
  
  // Payment & Terms
  paymentTerms: String,
  terms: String,
  
  // Tax Rates (percentages)
  taxRates: {
    state: { type: Number, default: 0 },
    city: { type: Number, default: 0 },
    country: { type: Number, default: 0 },
    misc: { type: Number, default: 0 },
    transportExcise: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
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
    default: 10, // 10% default commission
    min: 0,
    max: 100
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'active', 'ended', 'rejected'],
    default: 'pending'
  },
  
  // Statistics
  totalLots: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  
  // Images
  images: [{
    type: String
  }],
  
  // Featured
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for searching
auctionShopSchema.index({ title: 'text', description: 'text' });
auctionShopSchema.index({ status: 1, createdAt: -1 });

// Calculate total tax before saving
auctionShopSchema.pre('save', function() {
  if (this.taxRates) {
    const rates = this.taxRates;
    this.taxRates.total = (rates.state || 0) + (rates.city || 0) + (rates.country || 0) + (rates.misc || 0) + (rates.transportExcise || 0);
  }
});

module.exports = mongoose.model('AuctionShop', auctionShopSchema);

