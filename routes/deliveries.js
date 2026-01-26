const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const Delivery = require('../models/Delivery');
const Payment = require('../models/Payment');

// Configure multer for proof images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `delivery-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image and PDF files are allowed'));
  }
});

// Get user's deliveries
router.get('/my-deliveries', auth, async (req, res) => {
  try {
    const { role = 'buyer', status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (role === 'buyer') {
      query.buyer = req.user.id;
    } else {
      query.seller = req.user.id;
    }
    
    if (status) {
      query.status = status;
    }
    
    const deliveries = await Delivery.find(query)
      .populate('buyer', 'name email phone')
      .populate('seller', 'name email phone')
      .populate('auctionItem', 'title images')
      .populate('lot', 'title lotNumber images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Delivery.countDocuments(query);
    
    res.json({
      deliveries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single delivery
router.get('/:id', auth, async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('buyer', 'name email phone')
      .populate('seller', 'name email phone')
      .populate('auctionItem', 'title images')
      .populate('lot', 'title lotNumber images');
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    
    // Check authorization
    if (delivery.buyer.toString() !== req.user.id && 
        delivery.seller.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json({ delivery });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create delivery
router.post('/create', auth, async (req, res) => {
  try {
    const { auctionItemId, lotId, deliveryMethod, shippingAddress, pickupLocation, pickupDate } = req.body;
    
    // Get payment to verify buyer and seller
    const payment = await Payment.findOne({
      $or: [
        { auctionItem: auctionItemId },
        { lot: lotId }
      ]
    });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found. Please complete payment first.' });
    }
    
    // Check if delivery already exists
    const existingDelivery = await Delivery.findOne({
      $or: [
        { auctionItem: auctionItemId },
        { lot: lotId }
      ]
    });
    
    if (existingDelivery) {
      return res.status(400).json({ message: 'Delivery already exists for this item' });
    }
    
    const deliveryData = {
      auctionItem: auctionItemId,
      lot: lotId,
      buyer: payment.buyer,
      seller: payment.seller,
      deliveryMethod,
      status: 'pending'
    };
    
    if (deliveryMethod === 'shipping') {
      deliveryData.shippingAddress = JSON.parse(shippingAddress);
    } else if (deliveryMethod === 'pickup') {
      deliveryData.pickupLocation = JSON.parse(pickupLocation);
      deliveryData.pickupDate = pickupDate;
    }
    
    const delivery = new Delivery(deliveryData);
    await delivery.save();
    
    res.status(201).json({ delivery, message: 'Delivery created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update delivery status (seller)
router.put('/:id/status', auth, upload.array('proofImages', 3), async (req, res) => {
  try {
    const { status, trackingNumber, carrier, notes } = req.body;
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    
    // Only seller or admin can update status
    if (delivery.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    delivery.status = status;
    if (trackingNumber) delivery.trackingNumber = trackingNumber;
    if (carrier) delivery.carrier = carrier;
    if (notes) delivery.sellerNotes = notes;
    
    if (req.files && req.files.length > 0) {
      delivery.proofImages = req.files.map(file => file.filename);
    }
    
    await delivery.save();
    
    res.json({ delivery, message: 'Delivery status updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Confirm delivery (buyer)
router.post('/:id/confirm', auth, async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    
    // Only buyer can confirm delivery
    if (delivery.buyer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    delivery.status = 'confirmed';
    delivery.deliveryConfirmedBy = req.user.id;
    await delivery.save();
    
    res.json({ delivery, message: 'Delivery confirmed. Payment will be released to seller.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

