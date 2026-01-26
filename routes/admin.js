const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Auction = require('../models/Auction');
const AuctionShop = require('../models/AuctionShop');
const Lot = require('../models/Lot');
const Payment = require('../models/Payment');
const Delivery = require('../models/Delivery');
const Dispute = require('../models/Dispute');
const Order = require('../models/Order');
const Product = require('../models/Product');

// ==================== DASHBOARD STATS ====================

// Get admin dashboard statistics
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalAuctions,
      totalShops,
      totalLots,
      totalOrders,
      totalRevenue,
      pendingShops,
      activeDisputes,
      recentUsers,
      recentAuctions
    ] = await Promise.all([
      User.countDocuments(),
      Auction.countDocuments(),
      AuctionShop.countDocuments(),
      Lot.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      AuctionShop.countDocuments({ status: 'pending' }),
      Dispute.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt role'),
      Auction.find().sort({ createdAt: -1 }).limit(5).populate('seller', 'name email')
    ]);

    res.json({
      totalUsers,
      totalAuctions,
      totalShops,
      totalLots,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingShops,
      activeDisputes,
      recentUsers,
      recentAuctions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== USER MANAGEMENT ====================

// Get all users with pagination and filters
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status) query.accountStatus = status;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user status
router.put('/users/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { accountStatus } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { accountStatus },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user, message: `User ${accountStatus} successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user role
router.put('/users/:id/role', auth, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user, message: `User role updated to ${role}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== AUCTION SHOP MANAGEMENT ====================

// Get all auction shops with filters
router.get('/auction-shops', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const shops = await AuctionShop.find(query)
      .populate('shopOwner', 'name email')
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve auction shop
router.put('/auction-shops/:id/approve', auth, isAdmin, async (req, res) => {
  try {
    const shop = await AuctionShop.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('shopOwner', 'name email');

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // TODO: Send notification to shop owner

    res.json({ shop, message: 'Shop approved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject auction shop
router.put('/auction-shops/:id/reject', auth, isAdmin, async (req, res) => {
  try {
    const { reason } = req.body;

    const shop = await AuctionShop.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason },
      { new: true }
    ).populate('shopOwner', 'name email');

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // TODO: Send notification to shop owner with reason

    res.json({ shop, message: 'Shop rejected' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete auction shop
router.delete('/auction-shops/:id', auth, isAdmin, async (req, res) => {
  try {
    const shop = await AuctionShop.findByIdAndDelete(req.params.id);

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // Delete all lots in this shop
    await Lot.deleteMany({ auctionShop: req.params.id });

    res.json({ message: 'Shop and all its lots deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== AUCTION MANAGEMENT ====================

// Get all auctions with filters
router.get('/auctions', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const auctions = await Auction.find(query)
      .populate('seller', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Auction.countDocuments(query);

    res.json({
      auctions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete auction
router.delete('/auctions/:id', auth, isAdmin, async (req, res) => {
  try {
    const auction = await Auction.findByIdAndDelete(req.params.id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== DISPUTE MANAGEMENT ====================

// Get all disputes
router.get('/disputes', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority } = req.query;

    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const disputes = await Dispute.find(query)
      .populate('filedBy', 'name email')
      .populate('againstUser', 'name email')
      .populate('auctionItem', 'title')
      .populate('lot', 'title lotNumber')
      .populate('resolvedBy', 'name')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Dispute.countDocuments(query);

    res.json({
      disputes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Resolve dispute
router.post('/disputes/:id/resolve', auth, isAdmin, async (req, res) => {
  try {
    const { resolution, refundAmount, refundTo } = req.body;

    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();

    if (refundAmount && refundTo) {
      dispute.refundAmount = refundAmount;
      dispute.refundTo = refundTo;
    }

    await dispute.save();

    // TODO: Process refund if applicable
    // TODO: Send notifications to both parties

    res.json({ dispute, message: 'Dispute resolved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== ORDER MANAGEMENT ====================

// Get all orders
router.get('/orders', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'title price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== PRODUCT MANAGEMENT ====================

// Get all products
router.get('/products', auth, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('seller', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product
router.delete('/products/:id', auth, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

