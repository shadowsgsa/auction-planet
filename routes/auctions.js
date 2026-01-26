const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

// Get all auctions with filters
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      status = 'active', 
      search, 
      sort = '-createdAt',
      page = 1,
      limit = 12
    } = req.query;

    const query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const auctions = await Auction.find(query)
      .populate('category', 'name')
      .populate('seller', 'name email')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Auction.countDocuments(query);

    res.json({
      auctions,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single auction
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('category', 'name')
      .populate('seller', 'name email avatar')
      .populate('winner', 'name email');

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Get recent bids
    const bids = await Bid.find({ auction: auction._id })
      .populate('bidder', 'name')
      .sort('-createdAt')
      .limit(10);

    res.json({ auction, bids });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create auction
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      startingPrice,
      reservePrice,
      bidIncrement,
      startTime,
      endTime,
      condition,
      location,
      shippingAvailable
    } = req.body;

    const images = req.files ? req.files.map(file => file.filename) : [];

    const auction = new Auction({
      title,
      description,
      category,
      images,
      startingPrice,
      currentPrice: startingPrice,
      reservePrice: reservePrice || 0,
      bidIncrement: bidIncrement || 1,
      startTime,
      endTime,
      seller: req.userId,
      condition,
      location,
      shippingAvailable: shippingAvailable === 'true'
    });

    await auction.save();

    res.status(201).json({ auction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update auction
router.put('/:id', auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.seller.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (auction.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot edit active or ended auction' });
    }

    Object.assign(auction, req.body);
    await auction.save();

    res.json({ auction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete auction
router.delete('/:id', auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    if (auction.seller.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await auction.deleteOne();

    res.json({ message: 'Auction deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

