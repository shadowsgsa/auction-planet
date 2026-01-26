const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, avatar },
      { new: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's auctions
router.get('/my-auctions', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const query = { seller: req.userId };
    if (status) query.status = status;

    const auctions = await Auction.find(query)
      .populate('category', 'name')
      .sort('-createdAt')
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

// Get user's winning auctions
router.get('/my-wins', auth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const auctions = await Auction.find({ 
      winner: req.userId,
      status: 'ended'
    })
      .populate('category', 'name')
      .populate('seller', 'name email')
      .sort('-endTime')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Auction.countDocuments({ 
      winner: req.userId,
      status: 'ended'
    });

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

module.exports = router;

