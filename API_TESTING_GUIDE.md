# 🧪 API Testing Guide - Advanced Features

## Prerequisites
1. Server running on `http://localhost:3001` (or your configured port)
2. MongoDB connected
3. User account created and logged in
4. JWT token from login

---

## 🏪 Auction Shop API

### Create Auction Shop
```bash
POST http://localhost:3001/api/auction-shops
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: multipart/form-data

Body (form-data):
  title: "Estate Sale Auction"
  description: "Complete estate liquidation"
  shopAddress: {"line1":"123 Main St","city":"New York","state":"NY","zip":"10001"}
  shippingOptions: {"standard":10,"expedited":25,"overnight":50}
  taxRates: {"state":8.5,"city":0,"country":0}
  commissionRate: 10
  images: [file1.jpg, file2.jpg]
```

### Get All Auction Shops
```bash
GET http://localhost:3001/api/auction-shops?status=approved&page=1&limit=12
```

### Get Single Auction Shop (with lots)
```bash
GET http://localhost:3001/api/auction-shops/:shopId
```

---

## 🎯 Lots API

### Create Lot
```bash
POST http://localhost:3001/api/lots
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: multipart/form-data

Body (form-data):
  auctionShop: "SHOP_ID_HERE"
  title: "Antique Vase"
  description: "Beautiful 19th century vase"
  category: "CATEGORY_ID_HERE"
  condition: "good"
  startingBid: 100
  buyNowPrice: 500
  reservePrice: 200
  endDate: "2024-12-31T23:59:59Z"
  location: "New York, NY"
  shippingCost: 15
  shippingOption: "both"
  quantity: 1
  images: [file1.jpg, file2.jpg]
```

### Get All Lots
```bash
GET http://localhost:3001/api/lots?auctionShop=SHOP_ID&status=active&page=1
```

### Get Single Lot (with bid history)
```bash
GET http://localhost:3001/api/lots/:lotId
```

### Place Bid on Lot
```bash
POST http://localhost:3001/api/lots/:lotId/bid
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json

Body:
{
  "amount": 150
}
```

---

## 💳 Payments API (Escrow)

### Create Payment
```bash
POST http://localhost:3001/api/payments/create
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json

Body:
{
  "lotId": "LOT_ID_HERE",
  "paymentMethod": "credit_card"
}
```

### Get My Payments
```bash
GET http://localhost:3001/api/payments/my-payments?role=buyer&status=held
```

### Confirm Payment (Move to Escrow)
```bash
POST http://localhost:3001/api/payments/:paymentId/confirm
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

### Release Payment to Seller
```bash
POST http://localhost:3001/api/payments/:paymentId/release
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🚚 Deliveries API

### Create Delivery
```bash
POST http://localhost:3001/api/deliveries/create
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json

Body (Shipping):
{
  "lotId": "LOT_ID_HERE",
  "deliveryMethod": "shipping",
  "shippingAddress": {
    "name": "John Doe",
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "country": "USA",
    "phone": "555-1234"
  }
}

Body (Pickup):
{
  "lotId": "LOT_ID_HERE",
  "deliveryMethod": "pickup",
  "pickupLocation": {
    "name": "Auction House",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "phone": "555-5678"
  },
  "pickupDate": "2024-12-25T10:00:00Z"
}
```

### Get My Deliveries
```bash
GET http://localhost:3001/api/deliveries/my-deliveries?role=buyer&status=shipped
```

### Update Delivery Status (Seller)
```bash
PUT http://localhost:3001/api/deliveries/:deliveryId/status
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: multipart/form-data

Body:
  status: "shipped"
  trackingNumber: "1Z999AA10123456784"
  carrier: "ups"
  notes: "Package shipped via UPS Ground"
  proofImages: [file1.jpg]
```

### Confirm Delivery (Buyer)
```bash
POST http://localhost:3001/api/deliveries/:deliveryId/confirm
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

---

## ⚖️ Disputes API

### File Dispute
```bash
POST http://localhost:3001/api/disputes/file
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: multipart/form-data

Body:
  lotId: "LOT_ID_HERE"
  deliveryId: "DELIVERY_ID_HERE"
  disputeType: "item-not-as-described"
  title: "Item condition not as advertised"
  description: "The vase has significant damage not mentioned in listing"
  priority: "high"
  evidence: [file1.jpg, file2.jpg]
```

### Get My Disputes
```bash
GET http://localhost:3001/api/disputes/my-disputes?status=open
```

### Get All Disputes (Admin Only)
```bash
GET http://localhost:3001/api/disputes/admin/all?status=open&priority=high
Headers:
  Authorization: Bearer ADMIN_JWT_TOKEN
```

### Add Message to Dispute
```bash
POST http://localhost:3001/api/disputes/:disputeId/message
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: multipart/form-data

Body:
  message: "Here are additional photos showing the damage"
  attachments: [file1.jpg]
```

### Resolve Dispute (Admin Only)
```bash
POST http://localhost:3001/api/disputes/:disputeId/resolve
Headers:
  Authorization: Bearer ADMIN_JWT_TOKEN
  Content-Type: application/json

Body:
{
  "resolution": "Full refund issued to buyer due to item condition",
  "resolutionType": "refund"
}
```

---

## 🔄 Complete Workflow Test

### 1. Create Auction Shop
```bash
POST /api/auction-shops
# Save the returned shop ID
```

### 2. Create Lot in Shop
```bash
POST /api/lots
# Use shop ID from step 1
# Save the returned lot ID
```

### 3. Place Bid
```bash
POST /api/lots/:lotId/bid
# Bid on the lot
```

### 4. Create Payment (after winning)
```bash
POST /api/payments/create
# Use lot ID
# Save payment ID
```

### 5. Confirm Payment
```bash
POST /api/payments/:paymentId/confirm
# Payment moves to escrow
```

### 6. Create Delivery
```bash
POST /api/deliveries/create
# Use lot ID
# Save delivery ID
```

### 7. Update Delivery Status
```bash
PUT /api/deliveries/:deliveryId/status
# Seller marks as shipped
```

### 8. Confirm Delivery
```bash
POST /api/deliveries/:deliveryId/confirm
# Buyer confirms receipt
```

### 9. Release Payment
```bash
POST /api/payments/:paymentId/release
# Payment released to seller
```

### 10. (Optional) File Dispute
```bash
POST /api/disputes/file
# If there's an issue
```

---

## 📝 Notes

- Replace `YOUR_JWT_TOKEN` with actual token from login
- Replace IDs (SHOP_ID, LOT_ID, etc.) with actual MongoDB ObjectIds
- All dates should be in ISO 8601 format
- File uploads use `multipart/form-data`
- JSON requests use `application/json`

---

## 🧪 Testing Tools

### Postman
Import these endpoints into Postman for easy testing

### cURL Examples
```bash
# Login first
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Use returned token
export TOKEN="your_jwt_token_here"

# Create auction shop
curl -X POST http://localhost:3001/api/auction-shops \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=My Auction Shop" \
  -F "description=Great items for sale"
```

---

Happy Testing! 🚀

