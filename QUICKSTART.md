# Quick Start Guide - Auction Planet

## Prerequisites
- Node.js installed
- MongoDB installed and running (or use MongoDB Atlas)

## Step-by-Step Setup

### 1. Start MongoDB
If using local MongoDB, open a terminal and run:
```bash
mongod
```

### 2. Seed the Database
Open a new terminal in the project root and run:
```bash
npm run seed
```
This will create initial categories for the auction platform.

### 3. Start the Backend Server
In the same terminal (project root):
```bash
npm run dev
```
The backend will start on http://localhost:5000

### 4. Start the Frontend
Open a new terminal and navigate to the client folder:
```bash
cd client
npm run dev
```
The frontend will start on http://localhost:5173

### 5. Access the Application
Open your browser and go to: http://localhost:5173

## First Steps

1. **Register an Account**
   - Click "Register" in the navigation
   - Fill in your details
   - You'll be automatically logged in

2. **Create an Auction**
   - Click "Create Auction" in the navigation
   - Fill in the auction details
   - Upload images (optional)
   - Set start and end times
   - Submit the form

3. **Browse Auctions**
   - Click "Auctions" to see all listings
   - Use filters to search by category or status
   - Click on any auction to view details

4. **Place a Bid**
   - Open an active auction
   - Enter your bid amount (must be higher than current price)
   - Click "Place Bid"
   - Watch real-time updates as others bid!

5. **View Your Dashboard**
   - Click "Dashboard" to see:
     - Your created auctions
     - Your placed bids
     - Auctions you've won

## Default Categories
The seed script creates these categories:
- Electronics 💻
- Vehicles 🚗
- Art & Collectibles 🎨
- Jewelry & Watches 💎
- Home & Garden 🏠
- Fashion 👗
- Sports & Outdoors ⚽
- Books & Media 📚
- Toys & Hobbies 🎮
- Other 📦

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check the MONGODB_URI in your .env file
- Default: `mongodb://localhost:27017/auction-planet`

### Port Already in Use
- Backend (5000): Change PORT in .env
- Frontend (5173): Vite will automatically use the next available port

### Images Not Uploading
- Make sure the `uploads` folder exists in the project root
- Check file size (max 5MB per image)
- Only image files are allowed (jpg, png, gif, webp)

### Real-time Bidding Not Working
- Make sure both backend and frontend are running
- Check browser console for Socket.IO connection errors
- Verify CORS settings in server.js

## Features to Test

✅ User Registration & Login
✅ Create Auction with Images
✅ Browse & Search Auctions
✅ Filter by Category/Status
✅ Real-time Bidding
✅ Bid History
✅ User Dashboard
✅ My Auctions
✅ My Bids
✅ My Wins

## Next Steps

- Create multiple user accounts to test bidding between users
- Create auctions with different statuses and times
- Test the real-time bidding by opening the same auction in multiple browser windows
- Explore the responsive design on mobile devices

Enjoy your Auction Planet! 🚀

