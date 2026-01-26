const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Payment = require('../models/Payment');
const Auction = require('../models/Auction');
const Lot = require('../models/Lot');
const Delivery = require('../models/Delivery');

// Get user's payments (as buyer or seller)
router.get('/my-payments', auth, async (req, res) => {
  try {
    const { role = 'buyer', status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (role === 'buyer') {
      query.buyer = req.user.id;
    } else {
      query.seller = req.user.id;
    }
    
    if (status) {
      query.escrowStatus = status;
    }
    
    const payments = await Payment.find(query)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('auctionItem', 'title')
      .populate('lot', 'title lotNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Payment.countDocuments(query);
    
    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single payment
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('buyer', 'name email phone')
      .populate('seller', 'name email phone')
      .populate('auctionItem', 'title images')
      .populate('lot', 'title lotNumber images');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check authorization
    if (payment.buyer.toString() !== req.user.id && 
        payment.seller.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json({ payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payment (after auction win)
router.post('/create', auth, async (req, res) => {
  try {
    const { auctionItemId, lotId, paymentMethod } = req.body;
    
    let item, seller, totalAmount, commissionRate;
    
    if (auctionItemId) {
      item = await Auction.findById(auctionItemId);
      if (!item) {
        return res.status(404).json({ message: 'Auction not found' });
      }
      seller = item.seller;
      totalAmount = item.currentPrice;
      commissionRate = item.commissionRate;
    } else if (lotId) {
      item = await Lot.findById(lotId);
      if (!item) {
        return res.status(404).json({ message: 'Lot not found' });
      }
      seller = item.seller;
      totalAmount = item.highestBid;
      commissionRate = 10; // Default commission
    } else {
      return res.status(400).json({ message: 'Auction item or lot ID required' });
    }
    
    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      $or: [
        { auctionItem: auctionItemId },
        { lot: lotId }
      ]
    });
    
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already exists for this item' });
    }
    
    // Create payment
    const payment = new Payment({
      auctionItem: auctionItemId,
      lot: lotId,
      buyer: req.user.id,
      seller,
      totalAmount,
      commissionRate,
      paymentMethod,
      paymentProvider: 'stripe', // Default to Stripe
      escrowStatus: 'pending',
      paymentStatus: 'pending'
    });
    
    await payment.save();
    
    // TODO: Integrate with Stripe Payment Intent
    // const paymentIntent = await stripe.paymentIntents.create({...});
    // payment.stripePaymentIntentId = paymentIntent.id;
    // await payment.save();
    
    res.status(201).json({ 
      payment, 
      message: 'Payment created successfully',
      // clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Confirm payment (move to escrow)
router.post('/:id/confirm', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Update payment status
    payment.paymentStatus = 'completed';
    payment.escrowStatus = 'held';
    await payment.save();
    
    res.json({ payment, message: 'Payment confirmed and held in escrow' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Release payment to seller (after delivery confirmation)
router.post('/:id/release', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Only buyer or admin can release payment
    if (payment.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Check if delivery is confirmed
    const delivery = await Delivery.findOne({
      $or: [
        { auctionItem: payment.auctionItem },
        { lot: payment.lot }
      ]
    });
    
    if (!delivery || delivery.status !== 'confirmed') {
      return res.status(400).json({ message: 'Delivery must be confirmed before releasing payment' });
    }
    
    // Release payment
    payment.escrowStatus = 'released';
    await payment.save();
    
    // TODO: Transfer funds to seller via Stripe
    // const transfer = await stripe.transfers.create({...});
    // payment.stripeTransferId = transfer.id;
    // await payment.save();
    
    res.json({ payment, message: 'Payment released to seller' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

