const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const Lot = require('../models/Lot');
const AuctionShop = require('../models/AuctionShop');
const Bid = require('../models/Bid');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `lot-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Get all lots (with filters)
router.get('/', async (req, res) => {
  try {
    const { auctionShop, category, status, page = 1, limit = 12, search } = req.query;
    
    let query = {};
    if (auctionShop) query.auctionShop = auctionShop;
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$text = { $search: search };
    }
    
    const lots = await Lot.find(query)
      .populate('seller', 'name email avatar')
      .populate('category', 'name')
      .populate('auctionShop', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Lot.countDocuments(query);
    
    res.json({
      lots,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single lot
router.get('/:id', async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id)
      .populate('seller', 'name email avatar phone rating totalReviews')
      .populate('category', 'name')
      .populate('auctionShop', 'title shopAddress shippingOptions taxRates')
      .populate('highestBidder', 'name');
    
    if (!lot) {
      return res.status(404).json({ message: 'Lot not found' });
    }
    
    // Increment views
    lot.views += 1;
    await lot.save();
    
    // Get bid history
    const bids = await Bid.find({ lot: lot._id })
      .populate('bidder', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({ lot, bids });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create lot
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { auctionShop, title, description, category, condition, startingBid, buyNowPrice, reservePrice, endDate, location, shippingCost, shippingOption, quantity } = req.body;
    
    // Verify auction shop exists
    const shop = await AuctionShop.findById(auctionShop);
    if (!shop) {
      return res.status(404).json({ message: 'Auction shop not found' });
    }
    
    // Generate lot number
    const lotCount = await Lot.countDocuments({ auctionShop });
    const lotNumber = `LOT-${lotCount + 1}`;
    
    const lot = new Lot({
      auctionShop,
      seller: req.user.id,
      lotNumber,
      title,
      description,
      category,
      condition,
      startingBid,
      buyNowPrice,
      reservePrice,
      endDate,
      location,
      shippingCost,
      shippingOption,
      quantity,
      images: req.files ? req.files.map(file => file.filename) : []
    });
    
    await lot.save();
    
    // Update shop's total lots
    shop.totalLots += 1;
    await shop.save();
    
    res.status(201).json({ lot, message: 'Lot created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Place bid on lot
router.post('/:id/bid', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const lot = await Lot.findById(req.params.id);
    
    if (!lot) {
      return res.status(404).json({ message: 'Lot not found' });
    }
    
    // Validate bid
    if (lot.status !== 'active') {
      return res.status(400).json({ message: 'Lot is not active' });
    }
    
    if (new Date() > lot.endDate) {
      return res.status(400).json({ message: 'Auction has ended' });
    }
    
    if (lot.seller.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot bid on your own lot' });
    }
    
    const minBid = lot.highestBid > 0 ? lot.highestBid + lot.bidIncrement : lot.startingBid;
    if (amount < minBid) {
      return res.status(400).json({ message: `Minimum bid is $${minBid}` });
    }
    
    // Create bid
    const bid = new Bid({
      lot: lot._id,
      bidder: req.user.id,
      amount
    });
    await bid.save();
    
    // Update lot
    lot.highestBid = amount;
    lot.highestBidder = req.user.id;
    lot.totalBids += 1;
    await lot.save();
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(`lot_${lot._id}`).emit('newBid', {
      lotId: lot._id,
      amount,
      bidder: req.user.name,
      totalBids: lot.totalBids
    });
    
    res.json({ bid, lot, message: 'Bid placed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

