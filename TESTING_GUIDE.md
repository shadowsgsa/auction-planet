# Testing Guide - Auction Platform

## ✅ Backend Server Status
**Status**: ✅ Running Successfully
- **URL**: http://localhost:3001
- **Database**: MongoDB Atlas Connected
- **Auth Middleware**: Fixed and working

## 🧪 Testing the New Features

### 1. Test Product API (Buy Now Items)

#### Create a Product (requires authentication)
```bash
# First, login to get a token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Then create a product (replace YOUR_TOKEN with the token from login)
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Vintage Watch" \
  -F "description=Beautiful vintage watch in excellent condition" \
  -F "price=299.99" \
  -F "category=Fashion" \
  -F "condition=like-new" \
  -F "quantity=1" \
  -F "images=@path/to/image.jpg"
```

#### Get All Products (no auth required)
```bash
curl http://localhost:3001/api/products
```

#### Get Products with Filters
```bash
# Filter by condition
curl "http://localhost:3001/api/products?condition=new"

# Filter by price range
curl "http://localhost:3001/api/products?minPrice=100&maxPrice=500"

# Search products
curl "http://localhost:3001/api/products?search=watch"
```

### 2. Test Cart API (requires authentication)

#### Get Cart
```bash
curl http://localhost:3001/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Add Item to Cart
```bash
curl -X POST http://localhost:3001/api/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":"PRODUCT_ID","quantity":1}'
```

#### Update Cart Item Quantity
```bash
curl -X PUT http://localhost:3001/api/cart/update/CART_ITEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity":2}'
```

#### Remove Item from Cart
```bash
curl -X DELETE http://localhost:3001/api/cart/remove/CART_ITEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Clear Cart
```bash
curl -X DELETE http://localhost:3001/api/cart/clear \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Wishlist API (requires authentication)

#### Get Wishlist
```bash
curl http://localhost:3001/api/wishlist \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Add Product to Wishlist
```bash
curl -X POST http://localhost:3001/api/wishlist/product/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Remove Product from Wishlist
```bash
curl -X DELETE http://localhost:3001/api/wishlist/product/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test Orders API (requires authentication)

#### Get User Orders
```bash
curl http://localhost:3001/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Checkout (Create Order from Cart)
```bash
curl -X POST http://localhost:3001/api/orders/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "paymentMethod": "credit_card"
  }'
```

## 🌐 Frontend Testing

### Access the Application
1. **Frontend URL**: http://localhost:5173
2. **Backend API**: http://localhost:3001

### Test User Flow

#### 1. Register/Login
- Go to http://localhost:5173/register
- Create a new account
- Login with your credentials

#### 2. Browse Products
- Click "Buy Now" in the navigation
- View all available products
- Use filters to search by condition, price range

#### 3. Add to Cart
- Click "Add to Cart" on any product
- Check the cart icon in navbar (should show count)
- Click cart icon to view cart

#### 4. Manage Cart
- Update quantities using +/- buttons
- Remove items
- View total amount
- Click "Proceed to Checkout"

#### 5. Add to Favorites
- Click the heart icon on any product
- View your wishlist

#### 6. List a Product
- Go to "Sell Item" page
- Fill in product details
- Upload images
- Select "Buy Now" as sale type
- Submit the form

#### 7. View My Account
- Go to "My Account"
- View your dashboard
- Check different tabs (Listings, Purchases, etc.)

## 🐛 Common Issues & Solutions

### Issue: "Authentication failed"
**Solution**: Make sure you're logged in and using a valid token

### Issue: "Product not found"
**Solution**: Create some products first using the Sell Item page

### Issue: "Cannot add to cart"
**Solution**: Ensure you're logged in and the product exists

### Issue: Images not showing
**Solution**: Check that the `uploads` directory exists and has proper permissions

## ✅ Success Criteria
- ✅ Backend server running on port 3001
- ✅ Frontend running on port 5173
- ✅ MongoDB connected
- ✅ Can register/login users
- ✅ Can create products
- ✅ Can add products to cart
- ✅ Can view and manage cart
- ✅ Can add products to wishlist
- ✅ Cart count updates in navbar
- ✅ All pages render without errors

