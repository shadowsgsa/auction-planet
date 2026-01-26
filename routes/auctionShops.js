const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const AuctionShop = require('../models/AuctionShop');
const Lot = require('../models/Lot');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `shop-${Date.now()}${path.extname(file.originalname)}`);
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

// Get all auction shops
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 12, search } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$text = { $search: search };
    }
    
    const shops = await AuctionShop.find(query)
      .populate('shopOwner', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await AuctionShop.countDocuments(query);
    
    res.json({
      shops,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single auction shop
router.get('/:id', async (req, res) => {
  try {
    const shop = await AuctionShop.findById(req.params.id)
      .populate('shopOwner', 'name email avatar phone');
    
    if (!shop) {
      return res.status(404).json({ message: 'Auction shop not found' });
    }
    
    // Get lots for this shop
    const lots = await Lot.find({ auctionShop: shop._id })
      .populate('category', 'name')
      .sort({ lotNumber: 1 });
    
    res.json({ shop, lots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create auction shop
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const shopData = {
      ...req.body,
      shopOwner: req.user.id
    };
    
    // Parse nested objects
    if (req.body.shopAddress) {
      shopData.shopAddress = JSON.parse(req.body.shopAddress);
    }
    if (req.body.shippingContact) {
      shopData.shippingContact = JSON.parse(req.body.shippingContact);
    }
    if (req.body.shippingOptions) {
      shopData.shippingOptions = JSON.parse(req.body.shippingOptions);
    }
    if (req.body.taxRates) {
      shopData.taxRates = JSON.parse(req.body.taxRates);
    }
    if (req.body.inspectionPeriod) {
      shopData.inspectionPeriod = JSON.parse(req.body.inspectionPeriod);
    }
    if (req.body.removalPeriod) {
      shopData.removalPeriod = JSON.parse(req.body.removalPeriod);
    }
    
    // Add uploaded images
    if (req.files && req.files.length > 0) {
      shopData.images = req.files.map(file => file.filename);
    }
    
    const shop = new AuctionShop(shopData);
    await shop.save();
    
    res.status(201).json({ shop, message: 'Auction shop created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update auction shop
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const shop = await AuctionShop.findById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({ message: 'Auction shop not found' });
    }
    
    // Check ownership or admin
    if (shop.shopOwner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updateData = { ...req.body };
    
    // Parse nested objects
    if (req.body.shopAddress) {
      updateData.shopAddress = JSON.parse(req.body.shopAddress);
    }
    if (req.body.shippingContact) {
      updateData.shippingContact = JSON.parse(req.body.shippingContact);
    }
    if (req.body.shippingOptions) {
      updateData.shippingOptions = JSON.parse(req.body.shippingOptions);
    }
    if (req.body.taxRates) {
      updateData.taxRates = JSON.parse(req.body.taxRates);
    }
    
    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.filename);
      updateData.images = [...(shop.images || []), ...newImages];
    }
    
    Object.assign(shop, updateData);
    await shop.save();
    
    res.json({ shop, message: 'Auction shop updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

