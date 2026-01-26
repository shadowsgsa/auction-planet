const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  // Reference to auction item or lot
  auctionItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction'
  },
  lot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot'
  },
  
  // Reference to delivery
  delivery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery'
  },
  
  // Parties
  filedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  againstUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Dispute Details
  disputeType: {
    type: String,
    enum: [
      'item-not-received',
      'item-not-as-described',
      'damaged-item',
      'wrong-item',
      'payment-issue',
      'shipping-issue',
      'other'
    ],
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
  
  // Evidence
  evidenceUrls: [{
    type: String
  }],
  
  // Status
  status: {
    type: String,
    enum: ['open', 'investigating', 'awaiting-response', 'resolved', 'closed', 'escalated'],
    default: 'open'
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Resolution
  resolution: String,
  resolutionType: {
    type: String,
    enum: ['refund', 'partial-refund', 'replacement', 'no-action', 'other']
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  
  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isAdminMessage: {
      type: Boolean,
      default: false
    },
    attachments: [{
      type: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Admin Notes (internal)
  adminNotes: String,
  
  // Timestamps
  closedAt: Date,
  escalatedAt: Date
}, {
  timestamps: true
});

// Index for queries
disputeSchema.index({ filedBy: 1, status: 1 });
disputeSchema.index({ againstUser: 1, status: 1 });
disputeSchema.index({ status: 1, priority: -1, createdAt: -1 });
disputeSchema.index({ resolvedBy: 1 });

// Update timestamps based on status
disputeSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
    }
    if (this.status === 'closed' && !this.closedAt) {
      this.closedAt = new Date();
    }
    if (this.status === 'escalated' && !this.escalatedAt) {
      this.escalatedAt = new Date();
    }
  }
  next();
});

module.exports = mongoose.model('Dispute', disputeSchema);

