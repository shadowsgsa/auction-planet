const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const Dispute = require('../models/Dispute');
const Delivery = require('../models/Delivery');
const Payment = require('../models/Payment');

// Configure multer for evidence upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `dispute-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

// Get user's disputes
router.get('/my-disputes', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {
      $or: [
        { filedBy: req.user.id },
        { againstUser: req.user.id }
      ]
    };
    
    if (status) {
      query.status = status;
    }
    
    const disputes = await Dispute.find(query)
      .populate('filedBy', 'name email')
      .populate('againstUser', 'name email')
      .populate('auctionItem', 'title')
      .populate('lot', 'title lotNumber')
      .populate('delivery')
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
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all disputes (admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { status, priority, page = 1, limit = 20 } = req.query;
    
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
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single dispute
router.get('/:id', auth, async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('filedBy', 'name email phone')
      .populate('againstUser', 'name email phone')
      .populate('auctionItem', 'title images')
      .populate('lot', 'title lotNumber images')
      .populate('delivery')
      .populate('resolvedBy', 'name')
      .populate('messages.sender', 'name avatar');
    
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }
    
    // Check authorization
    if (dispute.filedBy._id.toString() !== req.user.id && 
        dispute.againstUser._id.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json({ dispute });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// File a dispute
router.post('/file', auth, upload.array('evidence', 5), async (req, res) => {
  try {
    const { auctionItemId, lotId, deliveryId, disputeType, title, description, priority } = req.body;
    
    // Get delivery to find the other party
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }
    
    // Determine against whom the dispute is filed
    const againstUser = delivery.buyer.toString() === req.user.id ? delivery.seller : delivery.buyer;
    
    const dispute = new Dispute({
      auctionItem: auctionItemId,
      lot: lotId,
      delivery: deliveryId,
      filedBy: req.user.id,
      againstUser,
      disputeType,
      title,
      description,
      priority: priority || 'medium',
      evidenceUrls: req.files ? req.files.map(file => file.filename) : []
    });
    
    await dispute.save();
    
    // Update delivery status
    delivery.status = 'disputed';
    await delivery.save();
    
    res.status(201).json({ dispute, message: 'Dispute filed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add message to dispute
router.post('/:id/message', auth, upload.array('attachments', 3), async (req, res) => {
  try {
    const { message } = req.body;
    const dispute = await Dispute.findById(req.params.id);
    
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }
    
    // Check authorization
    if (dispute.filedBy.toString() !== req.user.id && 
        dispute.againstUser.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const newMessage = {
      sender: req.user.id,
      message,
      isAdminMessage: req.user.role === 'admin',
      attachments: req.files ? req.files.map(file => file.filename) : []
    };
    
    dispute.messages.push(newMessage);
    await dispute.save();
    
    res.json({ dispute, message: 'Message added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Resolve dispute (admin only)
router.post('/:id/resolve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { resolution, resolutionType } = req.body;
    const dispute = await Dispute.findById(req.params.id);
    
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }
    
    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.resolutionType = resolutionType;
    dispute.resolvedBy = req.user.id;
    await dispute.save();
    
    // Handle resolution actions
    if (resolutionType === 'refund' || resolutionType === 'partial-refund') {
      // TODO: Process refund via payment system
      const payment = await Payment.findOne({
        $or: [
          { auctionItem: dispute.auctionItem },
          { lot: dispute.lot }
        ]
      });
      
      if (payment) {
        payment.paymentStatus = 'refunded';
        await payment.save();
      }
    }
    
    res.json({ dispute, message: 'Dispute resolved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

