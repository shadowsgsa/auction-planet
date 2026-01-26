# 🏪 Consignment Page - Auction Shop Creation Fields

## Overview
The **Consignment page** is designed to create an **Auction Shop** (not individual items). Once the shop is created and approved by admin, the shop owner can then add **Lots** (individual auction items) to their shop.

---

## 📋 Required Fields for Auction Shop Creation

### Step 1: Shop Info

#### Basic Information
- **title** (required) - Auction shop title
  - Example: "Estate Sale Auction", "Luxury Watches Auction"
- **description** (required) - Shop description
  - What types of items will be sold
  - Shop specialization

#### Commission & Fees
- **commissionRate** (required) - Platform commission percentage (0-100)
  - Default: 10%
- **listingFee** (optional) - One-time fee to list the shop
  - Default: 0

---

### Step 2: Shop Photos

#### Images
- **images** (optional) - Shop photos or featured items
  - Maximum: 5 images
  - Formats: JPEG, JPG, PNG, GIF, WEBP
  - Max size: 5MB per image

---

### Step 3: Address & Shipping

#### Shop Address
- **shopAddressLine1** (required) - Street address
- **shopAddressLine2** (optional) - Apartment, suite, etc.
- **shopCity** (required) - City
- **shopState** (required) - State (e.g., NY, CA)
- **shopZip** (required) - ZIP code
- **shopCountry** (required) - Country (default: USA)

#### Shipping Contact
- **shippingContactName** (optional) - Shipping coordinator name
- **shippingContactPhone** (optional) - Contact phone number

#### Shipping Options (Prices in $)
- **standardShipping** (optional) - Standard shipping price
- **expeditedShipping** (optional) - Expedited shipping price
- **overnightShipping** (optional) - Overnight shipping price

#### Tax Rates (Percentages)
- **stateTaxRate** (optional) - State tax rate (0-100%)
- **cityTaxRate** (optional) - City tax rate (0-100%)
- **countryTaxRate** (optional) - Country tax rate (0-100%)
- **miscTaxRate** (optional) - Miscellaneous tax rate (0-100%)
- **transportExciseTaxRate** (optional) - Transport excise tax rate (0-100%)

---

### Step 4: Terms & Fees

#### Inspection Period
- **inspectionStart** (optional) - When buyers can start inspecting items
- **inspectionEnd** (optional) - When inspection period ends

#### Removal Period
- **removalStart** (optional) - When items can be picked up (start)
- **removalEnd** (optional) - When items must be picked up by (end)

#### Terms
- **paymentTerms** (optional) - Payment terms and conditions
  - Example: "Payment due within 48 hours of auction end"
- **terms** (optional) - General terms and conditions for the shop

---

## 🔄 Workflow

### 1. Create Auction Shop (Consignment Page)
```
User fills out consignment form → Submits for review → Status: "pending"
```

### 2. Admin Approval
```
Admin reviews shop → Approves → Status: "approved" → Status: "active"
```

### 3. Add Lots to Shop
```
Shop owner creates lots (individual items) within their shop
Each lot has its own:
- Title, description, images
- Starting bid, reserve price, buy now price
- Auction dates
- Category, condition
- Shipping options
```

### 4. Auction Process
```
Lots go live → Users bid → Auction ends → Winner determined
→ Payment created (escrow) → Delivery → Payment released
```

---

## 📊 Database Structure

### AuctionShop Model
```javascript
{
  shopOwner: ObjectId (User),
  title: String (required),
  description: String,
  
  shopAddress: {
    line1, line2, city, state, zip, country
  },
  
  shippingContact: {
    name, phone
  },
  
  shippingOptions: {
    standard, expedited, overnight
  },
  
  taxRates: {
    state, city, country, misc, transportExcise, total
  },
  
  inspectionPeriod: {
    start, end
  },
  
  removalPeriod: {
    start, end
  },
  
  paymentTerms: String,
  terms: String,
  
  listingFee: Number,
  listingFeePaid: Boolean,
  commissionRate: Number,
  
  status: 'pending' | 'approved' | 'active' | 'ended' | 'rejected',
  
  totalLots: Number,
  totalRevenue: Number,
  
  images: [String],
  isFeatured: Boolean
}
```

---

## 🎯 Key Differences

### Consignment Page (Auction Shop)
- Creates the **container** for auctions
- Sets up shop-level settings (tax, shipping, fees)
- Requires admin approval
- One-time setup per shop

### Sell Item Page (Individual Auction)
- Creates a **single auction item**
- Immediate listing (no shop required)
- No admin approval needed
- Quick one-off sales

### Lots (Within Auction Shop)
- Created **after** shop is approved
- Multiple lots per shop
- Inherits shop settings (tax, shipping)
- Part of organized auction event

---

## 📝 API Endpoint

### Create Auction Shop
```
POST /api/auction-shops
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- title
- description
- shopAddress (JSON string)
- shippingContact (JSON string)
- shippingOptions (JSON string)
- taxRates (JSON string)
- inspectionPeriod (JSON string)
- removalPeriod (JSON string)
- paymentTerms
- terms
- listingFee
- commissionRate
- images (files)
```

---

## ✅ Implementation Status

- ✅ Backend model created (AuctionShop.js)
- ✅ Backend routes created (routes/auctionShops.js)
- ✅ Frontend form updated (Consignment.jsx)
- ✅ All required fields included
- ✅ Multi-step wizard (4 steps)
- ✅ Image upload support
- ✅ Form validation
- ✅ Draft saving
- ✅ API integration

---

## 🚀 Next Steps

1. **Test the consignment page**
   - Fill out all fields
   - Upload images
   - Submit for review

2. **Admin approval workflow**
   - Create admin dashboard
   - Review pending shops
   - Approve/reject shops

3. **Create lots within shop**
   - After shop approval
   - Add individual auction items
   - Set lot-specific details

---

**The consignment page now correctly creates Auction Shops with all necessary fields!**

