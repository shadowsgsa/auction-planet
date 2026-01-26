const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Reference to auction item or lot
  auctionItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction'
  },
  lot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot'
  },
  
  // Parties
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Amounts
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  sellerAmount: {
    type: Number,
    required: true,
    min: 0
  },
  platformCommission: {
    type: Number,
    required: true,
    min: 0
  },
  commissionRate: {
    type: Number,
    default: 10, // percentage
    min: 0,
    max: 100
  },
  
  // Escrow Status
  escrowStatus: {
    type: String,
    enum: ['pending', 'held', 'released', 'refunded'],
    default: 'pending'
  },
  
  // Payment Provider Details
  paymentProvider: {
    type: String,
    enum: ['stripe', 'paypal', 'square', 'manual'],
    default: 'stripe'
  },
  stripePaymentIntentId: String,
  stripeTransferId: String,
  paypalTransactionId: String,
  
  // Payment Method
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer'],
    default: 'credit_card'
  },
  
  // Status
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Timestamps
  paidAt: Date,
  releasedAt: Date,
  refundedAt: Date,
  
  // Notes
  notes: String,
  failureReason: String,
  
  // Metadata
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for queries
paymentSchema.index({ buyer: 1, paymentStatus: 1 });
paymentSchema.index({ seller: 1, escrowStatus: 1 });
paymentSchema.index({ escrowStatus: 1, createdAt: -1 });

// Calculate seller amount and commission before saving
paymentSchema.pre('save', function(next) {
  if (this.isModified('totalAmount') || this.isModified('commissionRate')) {
    this.platformCommission = (this.totalAmount * this.commissionRate) / 100;
    this.sellerAmount = this.totalAmount - this.platformCommission;
  }
  next();
});

// Update timestamps based on status
paymentSchema.pre('save', function(next) {
  if (this.isModified('paymentStatus') && this.paymentStatus === 'completed' && !this.paidAt) {
    this.paidAt = new Date();
  }
  if (this.isModified('escrowStatus') && this.escrowStatus === 'released' && !this.releasedAt) {
    this.releasedAt = new Date();
  }
  if (this.isModified('paymentStatus') && this.paymentStatus === 'refunded' && !this.refundedAt) {
    this.refundedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);

