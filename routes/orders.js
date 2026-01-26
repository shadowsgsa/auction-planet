const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('items.product', 'title images')
      .populate('items.seller', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'title images')
      .populate('items.seller', 'name email')
      .populate('buyer', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.buyer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create order from cart
router.post('/checkout', auth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Validate all products are available
    for (const item of cart.items) {
      if (!item.product || item.product.status !== 'active') {
        return res.status(400).json({ 
          message: `Product ${item.product?.title || 'unknown'} is no longer available` 
        });
      }
      
      if (item.product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient quantity for ${item.product.title}` 
        });
      }
    }
    
    // Create order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      title: item.product.title,
      quantity: item.quantity,
      price: item.price,
      seller: item.product.seller
    }));
    
    // Create order
    const order = new Order({
      buyer: req.user.id,
      items: orderItems,
      totalAmount: cart.totalAmount,
      shippingAddress,
      paymentMethod
    });
    
    await order.save();
    
    // Update product quantities
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      product.quantity -= item.quantity;
      
      if (product.quantity === 0) {
        product.status = 'sold';
      }
      
      await product.save();
    }
    
    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (seller only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is seller of any item in the order
    const isSeller = order.items.some(
      item => item.seller.toString() === req.user.id
    );
    
    if (!isSeller) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    order.status = status;
    await order.save();
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

