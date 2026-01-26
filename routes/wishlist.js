const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { auth } = require('../middleware/auth');

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
    let wishlist = await Wishlist.findOne({ user: userId })
      .populate('products', 'title price images condition')
      .populate('auctions', 'title currentBid endTime images');
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, products: [], auctions: [] });
      await wishlist.save();
    }
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add product to wishlist
router.post('/product/:productId', auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, products: [], auctions: [] });
    }
    
    if (!wishlist.products.includes(req.params.productId)) {
      wishlist.products.push(req.params.productId);
      await wishlist.save();
    }
    
    await wishlist.populate('products', 'title price images condition');
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove product from wishlist
router.delete('/product/:productId', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    wishlist.products = wishlist.products.filter(
      id => id.toString() !== req.params.productId
    );
    
    await wishlist.save();
    await wishlist.populate('products', 'title price images condition');
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add auction to wishlist
router.post('/auction/:auctionId', auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, products: [], auctions: [] });
    }
    
    if (!wishlist.auctions.includes(req.params.auctionId)) {
      wishlist.auctions.push(req.params.auctionId);
      await wishlist.save();
    }
    
    await wishlist.populate('auctions', 'title currentBid endTime images');
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove auction from wishlist
router.delete('/auction/:auctionId', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    wishlist.auctions = wishlist.auctions.filter(
      id => id.toString() !== req.params.auctionId
    );
    
    await wishlist.save();
    await wishlist.populate('auctions', 'title currentBid endTime images');
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

