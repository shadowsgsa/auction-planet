const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction'
  },
  lot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot'
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  isAutoBid: {
    type: Boolean,
    default: false
  },
  maxAutoBid: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure either auction or lot is set, but not both
bidSchema.pre('validate', function(next) {
  if (!this.auction && !this.lot) {
    next(new Error('Either auction or lot must be specified'));
  } else if (this.auction && this.lot) {
    next(new Error('Cannot specify both auction and lot'));
  } else {
    next();
  }
});

// Index for faster queries
bidSchema.index({ auction: 1, createdAt: -1 });
bidSchema.index({ lot: 1, createdAt: -1 });
bidSchema.index({ bidder: 1, createdAt: -1 });

module.exports = mongoose.model('Bid', bidSchema);

