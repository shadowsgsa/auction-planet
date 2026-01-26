# Quick Reference Guide

## 🚀 Starting the Application

### Terminal 1 - Backend Server
```bash
npm run dev
```
✅ Server runs on: http://localhost:3001

### Terminal 2 - Frontend Server
```bash
cd client
npm run dev
```
✅ Frontend runs on: http://localhost:5173

---

## 🔑 API Endpoints Quick Reference

### Authentication
```
POST /api/auth/register    - Register new user
POST /api/auth/login       - Login user
GET  /api/auth/me          - Get current user
```

### Products (Buy Now Items)
```
GET    /api/products              - Get all products
GET    /api/products/:id          - Get single product
POST   /api/products              - Create product (auth required)
PUT    /api/products/:id          - Update product (auth required)
DELETE /api/products/:id          - Delete product (auth required)
```

### Shopping Cart
```
GET    /api/cart                  - Get user's cart (auth required)
POST   /api/cart/add              - Add item to cart (auth required)
PUT    /api/cart/update/:itemId   - Update quantity (auth required)
DELETE /api/cart/remove/:itemId   - Remove item (auth required)
DELETE /api/cart/clear             - Clear cart (auth required)
```

### Wishlist
```
GET    /api/wishlist                      - Get wishlist (auth required)
POST   /api/wishlist/product/:productId   - Add product (auth required)
DELETE /api/wishlist/product/:productId   - Remove product (auth required)
POST   /api/wishlist/auction/:auctionId   - Add auction (auth required)
DELETE /api/wishlist/auction/:auctionId   - Remove auction (auth required)
```

### Orders
```
GET  /api/orders              - Get user orders (auth required)
GET  /api/orders/:id          - Get single order (auth required)
POST /api/orders/checkout     - Create order from cart (auth required)
PUT  /api/orders/:id/status   - Update order status (auth required)
```

### Auctions
```
GET    /api/auctions           - Get all auctions
GET    /api/auctions/:id       - Get single auction
POST   /api/auctions           - Create auction (auth required)
PUT    /api/auctions/:id       - Update auction (auth required)
DELETE /api/auctions/:id       - Delete auction (auth required)
```

### Bids
```
GET  /api/bids/auction/:auctionId  - Get bids for auction
POST /api/bids                     - Place bid (auth required)
```

---

## 🌐 Frontend Routes

### Public Routes
```
/                  - Home page
/auctions          - Browse auctions
/buy-now           - Browse Buy Now products
/login             - Login page
/register          - Register page
```

### Protected Routes (require login)
```
/my-account        - User dashboard
/sell-item         - List new item
/consignment       - Consignment submission
/cart              - Shopping cart
/create-auction    - Create auction
/auction/:id       - Auction details
```

---

## 💡 Common Tasks

### 1. Create a Test User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Login and Get Token
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Create a Product
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Test Product" \
  -F "description=A test product" \
  -F "price=99.99" \
  -F "category=Electronics" \
  -F "condition=new" \
  -F "quantity=5"
```

### 4. Add to Cart
```bash
curl -X POST http://localhost:3001/api/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ID",
    "quantity": 1
  }'
```

### 5. View Cart
```bash
curl http://localhost:3001/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎨 Key Components

### Context Providers
- **AuthContext** - User authentication state
- **CartContext** - Shopping cart state
- **WishlistContext** - Wishlist/favorites state

### Main Pages
- **Home** - Landing page with featured items
- **BuyNow** - Product marketplace
- **Cart** - Shopping cart management
- **MyAccount** - User dashboard
- **SellItem** - List new items
- **AuctionList** - Browse auctions
- **AuctionDetail** - Auction details and bidding

---

## 🔧 Environment Variables

### Backend (.env)
```
PORT=3001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Frontend (client/.env)
```
VITE_API_URL=http://localhost:3001/api
```

---

## 📁 Project Structure

```
newAuction/
├── models/           # Database models
├── routes/           # API routes
├── middleware/       # Auth middleware
├── uploads/          # Uploaded images
├── client/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
└── server.js         # Express server
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Ensure port 3001 is available
- Check .env file exists

### Frontend won't start
- Run `npm install` in client directory
- Check port 5173 is available
- Verify VITE_API_URL in .env

### Can't add to cart
- Ensure you're logged in
- Check product exists
- Verify token is valid

### Images not showing
- Check uploads directory exists
- Verify file permissions
- Check image paths in database

---

## ✅ Quick Health Check

```bash
# Check backend
curl http://localhost:3001/api/products

# Check if MongoDB is connected
# Look for "MongoDB Connected" in server logs
```

---

**Last Updated**: January 13, 2026

