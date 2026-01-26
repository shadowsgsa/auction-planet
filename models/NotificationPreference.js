const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // General Notification Channels
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  
  // Bidding Notifications
  bidNotifications: {
    type: Boolean,
    default: true
  },
  outbidAlerts: {
    type: Boolean,
    default: true
  },
  winningNotifications: {
    type: Boolean,
    default: true
  },
  
  // Auction Notifications
  auctionStarting: {
    type: Boolean,
    default: true
  },
  auctionEnding: {
    type: Boolean,
    default: true
  },
  auctionUpdates: {
    type: Boolean,
    default: true
  },
  newAuctionsInCategories: {
    type: Boolean,
    default: false
  },
  
  // Payment Notifications
  paymentReminders: {
    type: Boolean,
    default: true
  },
  paymentConfirmations: {
    type: Boolean,
    default: true
  },
  refundNotifications: {
    type: Boolean,
    default: true
  },
  
  // Delivery Notifications
  shippingUpdates: {
    type: Boolean,
    default: true
  },
  deliveryConfirmations: {
    type: Boolean,
    default: true
  },
  
  // Seller Notifications
  newBidReceived: {
    type: Boolean,
    default: true
  },
  itemSold: {
    type: Boolean,
    default: true
  },
  paymentReceived: {
    type: Boolean,
    default: true
  },
  
  // Marketing & Promotional
  marketingEmails: {
    type: Boolean,
    default: false
  },
  weeklyDigest: {
    type: Boolean,
    default: false
  },
  specialOffers: {
    type: Boolean,
    default: false
  },
  
  // Account & Security
  accountUpdates: {
    type: Boolean,
    default: true
  },
  securityAlerts: {
    type: Boolean,
    default: true
  },
  
  // Dispute Notifications
  disputeUpdates: {
    type: Boolean,
    default: true
  },
  
  // Favorite Categories (for new auction alerts)
  favoriteCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  
  // Notification Frequency
  digestFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'never'],
    default: 'weekly'
  }
}, {
  timestamps: true
});

// Index for queries
notificationPreferenceSchema.index({ user: 1 });

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);

