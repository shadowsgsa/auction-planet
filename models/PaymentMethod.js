const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Payment Type
  paymentType: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_account'],
    required: true
  },
  
  // Card Details (for credit/debit cards)
  cardLast4: String,
  cardBrand: {
    type: String,
    enum: ['visa', 'mastercard', 'amex', 'discover', 'other']
  },
  cardholderName: String,
  expiryMonth: Number,
  expiryYear: Number,
  
  // Stripe Details
  stripePaymentMethodId: String,
  stripeCustomerId: String,
  
  // PayPal Details
  paypalEmail: String,
  paypalAccountId: String,
  
  // Bank Account Details
  bankName: String,
  accountLast4: String,
  accountType: {
    type: String,
    enum: ['checking', 'savings']
  },
  
  // Billing Address
  billingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  
  // Default Payment Method
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  
  // Status
  status: {
    type: String,
    enum: ['active', 'expired', 'disabled'],
    default: 'active'
  },
  
  // Nickname (optional)
  nickname: String
}, {
  timestamps: true
});

// Index for queries
paymentMethodSchema.index({ user: 1, isDefault: -1 });
paymentMethodSchema.index({ user: 1, status: 1 });
paymentMethodSchema.index({ stripePaymentMethodId: 1 });

// Ensure only one default payment method per user
paymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Set all other payment methods for this user to not default
    await mongoose.model('PaymentMethod').updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);

