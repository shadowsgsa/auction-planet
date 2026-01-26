const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
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
  
  // Delivery Method
  deliveryMethod: {
    type: String,
    enum: ['shipping', 'pickup'],
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'in-transit', 'delivered', 'picked-up', 'confirmed', 'disputed'],
    default: 'pending'
  },
  
  // Shipping Details (if deliveryMethod is 'shipping')
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' },
    phone: String
  },
  trackingNumber: String,
  carrier: {
    type: String,
    enum: ['usps', 'ups', 'fedex', 'dhl', 'other']
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  
  // Pickup Details (if deliveryMethod is 'pickup')
  pickupLocation: {
    name: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String
  },
  pickupDate: Date,
  pickupTimeSlot: String,
  pickupInstructions: String,
  
  // Confirmation
  deliveryConfirmedAt: Date,
  deliveryConfirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pickupConfirmedAt: Date,
  pickupConfirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  shippedAt: Date,
  deliveredAt: Date,
  
  // Notes
  notes: String,
  buyerNotes: String,
  sellerNotes: String,
  
  // Images (proof of delivery/pickup)
  proofImages: [{
    type: String
  }],
  
  // Signature
  signatureUrl: String,
  signedBy: String
}, {
  timestamps: true
});

// Index for queries
deliverySchema.index({ buyer: 1, status: 1 });
deliverySchema.index({ seller: 1, status: 1 });
deliverySchema.index({ status: 1, createdAt: -1 });
deliverySchema.index({ trackingNumber: 1 });

// Update timestamps based on status
deliverySchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'shipped' && !this.shippedAt) {
      this.shippedAt = new Date();
    }
    if (this.status === 'delivered' && !this.deliveredAt) {
      this.deliveredAt = new Date();
    }
    if ((this.status === 'confirmed' || this.status === 'delivered') && !this.deliveryConfirmedAt && this.deliveryMethod === 'shipping') {
      this.deliveryConfirmedAt = new Date();
    }
    if ((this.status === 'confirmed' || this.status === 'picked-up') && !this.pickupConfirmedAt && this.deliveryMethod === 'pickup') {
      this.pickupConfirmedAt = new Date();
    }
  }
  next();
});

module.exports = mongoose.model('Delivery', deliverySchema);

