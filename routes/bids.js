const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Bid = require('../models/Bid');
const Auction = require('../models/Auction');

// Place a bid
router.post('/', auth, async (req, res) => {
  try {
    const { auctionId, amount, isAutoBid, maxAutoBid } = req.body;

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if auction is active
    const now = new Date();
    if (auction.status !== 'active' || now < auction.startTime || now > auction.endTime) {
      return res.status(400).json({ message: 'Auction is not active' });
    }

    // Check if user is the seller
    if (auction.seller.toString() === req.userId) {
      return res.status(400).json({ message: 'Cannot bid on your own auction' });
    }

    // Validate bid amount
    const minBid = auction.currentPrice + auction.bidIncrement;
    if (amount < minBid) {
      return res.status(400).json({ 
        message: `Bid must be at least ${minBid}` 
      });
    }

    // Create bid
    const bid = new Bid({
      auction: auctionId,
      bidder: req.userId,
      amount,
      isAutoBid: isAutoBid || false,
      maxAutoBid: maxAutoBid || 0
    });

    await bid.save();

    // Update auction
    auction.currentPrice = amount;
    auction.totalBids += 1;
    await auction.save();

    // Populate bid data
    await bid.populate('bidder', 'name email');

    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.to(`auction_${auctionId}`).emit('newBid', {
      bid,
      auction: {
        id: auction._id,
        currentPrice: auction.currentPrice,
        totalBids: auction.totalBids
      }
    });

    res.status(201).json({ bid, auction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bids for an auction
router.get('/auction/:auctionId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const bids = await Bid.find({ auction: req.params.auctionId })
      .populate('bidder', 'name')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Bid.countDocuments({ auction: req.params.auctionId });

    res.json({
      bids,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bids
router.get('/my-bids', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const bids = await Bid.find({ bidder: req.userId })
      .populate('auction', 'title images currentPrice endTime status')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Bid.countDocuments({ bidder: req.userId });

    res.json({
      bids,
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

