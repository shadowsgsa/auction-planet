const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    // origin: process.env.CLIENT_URL || 'http://localhost:5000',
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auction-planet')
mongoose.connect('mongodb://localhost:27017/auction-planet')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Socket.IO for real-time bidding
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join auction room
  socket.on('joinAuction', (auctionId) => {
    socket.join(`auction_${auctionId}`);
    console.log(`Client ${socket.id} joined auction ${auctionId}`);
  });

  socket.on('leaveAuction', (auctionId) => {
    socket.leave(`auction_${auctionId}`);
    console.log(`Client ${socket.id} left auction ${auctionId}`);
  });

  // Join lot room
  socket.on('joinLot', (lotId) => {
    socket.join(`lot_${lotId}`);
    console.log(`Client ${socket.id} joined lot ${lotId}`);
  });

  socket.on('leaveLot', (lotId) => {
    socket.leave(`lot_${lotId}`);
    console.log(`Client ${socket.id} left lot ${lotId}`);
  });

  // Join auction shop room
  socket.on('joinShop', (shopId) => {
    socket.join(`shop_${shopId}`);
    console.log(`Client ${socket.id} joined shop ${shopId}`);
  });

  socket.on('leaveShop', (shopId) => {
    socket.leave(`shop_${shopId}`);
    console.log(`Client ${socket.id} left shop ${shopId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auctions', require('./routes/auctions'));
app.use('/api/bids', require('./routes/bids'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/orders', require('./routes/orders'));

// New Advanced Routes
app.use('/api/auction-shops', require('./routes/auctionShops'));
app.use('/api/lots', require('./routes/lots'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/disputes', require('./routes/disputes'));

// Admin Routes
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

