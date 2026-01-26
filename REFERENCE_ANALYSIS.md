# Reference Auction Platform Analysis

## 🎯 Overview
The reference platform (auction-planet) is a **full-stack TypeScript/React auction platform** using:
- **Frontend**: React + TypeScript + Vite + shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Payment**: Stripe integration
- **State Management**: React Context API + TanStack Query

---

## 📊 Database Schema (Supabase)

### Core Tables

#### 1. **auction_items**
- `id`, `title`, `description`, `category`, `condition`
- `starting_price`, `current_price`, `reserve_price`
- `start_time`, `end_time`, `status`
- `seller_id`, `winner_id`
- `image_url`, `images` (JSON array)
- `consignment_status` (pending/approved/rejected)
- `listing_fee`, `listing_fee_paid`, `commission_rate`
- `inspection_start`, `inspection_end`
- `removal_start`, `removal_end`
- `payment_status`, `auction_completed_at`
- `quantity`

#### 2. **auction_shop**
- Auction house/shop management
- `shopowner_id`, `title`, `description`
- `shop_address_line1`, `shop_address_line2`, `shop_city`, `shop_state`, `shop_zip`, `shop_country`
- `shipping_contact_name`, `shipping_contact_phone`
- `standard_shipping`, `expedited_shipping`, `overnight_shipping`
- `payment_terms`, `terms`
- Tax rates: `state_tax_rate`, `city_tax_rate`, `country_tax_rate`, `misc_tax_rate`, `transport_excise_tax_rate`, `total_tax`
- `inspection_start`, `inspection_end`
- `removal_start`, `removal_end`
- `listing_fee`, `listing_fee_paid`, `commission_rate`
- `consignment_status`

#### 3. **bids**
- `id`, `auction_item_id`, `bidder_id`, `amount`, `created_at`

#### 4. **lots**
- Individual auction lots within an auction shop
- `auction_id` (FK to auction_shop)
- `title`, `description`, `category`, `condition`
- `starting_bid`, `highest_bid`, `highest_bidder_id`
- `buy_now_price`, `reserve_price`
- `start_date`, `end_date`
- `image_urls` (array)
- `location`, `shipping_cost`, `shipping_option`
- `seller_id`

#### 5. **auction_payments**
- Escrow payment system
- `auction_item_id`, `buyer_id`, `seller_id`
- `total_amount`, `seller_amount`, `platform_commission`
- `escrow_status` (pending/held/released)
- `stripe_payment_intent_id`, `stripe_transfer_id`
- `released_at`

#### 6. **auction_deliveries**
- Delivery tracking
- `auction_item_id`, `buyer_id`, `seller_id`
- `delivery_method` (shipping/pickup)
- `status` (pending/shipped/delivered/confirmed)
- `shipping_address`, `tracking_number`
- `pickup_location`, `pickup_date`
- `shipped_at`, `delivered_at`, `delivery_confirmed_at`
- `pickup_confirmed_at`, `pickup_confirmed_by`

#### 7. **auction_disputes**
- Dispute resolution system
- `auction_item_id`, `delivery_id`, `filed_by`
- `dispute_type`, `description`
- `evidence_urls` (array)
- `status` (open/investigating/resolved/closed)
- `resolution`, `resolved_by`, `resolved_at`

#### 8. **profiles**
- User profiles
- `user_id`, `display_name`, `bio`, `avatar_url`
- `phone`, `address`, `city`, `state`, `zip_code`, `country`
- `user_type` (buyer/seller/both)

#### 9. **payment_methods**
- Saved payment methods
- `user_id`, `payment_type` (credit_card/debit_card/paypal)
- `card_number` (encrypted), `cardholder_name`, `expiry_date`
- `billing_address`, `billing_city`, `billing_state`, `billing_zip`, `billing_country`
- `is_default`

#### 10. **notification_preferences**
- User notification settings
- `user_id`
- `email_notifications`, `sms_notifications`, `push_notifications`
- `bid_notifications`, `outbid_alerts`, `winning_notifications`
- `auction_updates`, `payment_reminders`, `marketing_emails`

#### 11. **user_roles**
- Role-based access control
- `user_id`, `role` (admin/user enum)

---

## 🔧 Key Features

### 1. **Authentication & Authorization**
- Supabase Auth with email/password
- Google OAuth integration
- Admin role system
- Profile management

### 2. **Auction System**
- Create auction items
- Real-time bidding
- Reserve price
- Buy Now option
- Auction timer/countdown
- Consignment workflow (pending → approved → active)

### 3. **Auction Shop Management**
- Create auction houses/shops
- Multiple lots per shop
- Shop-specific settings
- Tax configuration
- Shipping options

### 4. **Payment & Escrow**
- Stripe integration
- Escrow system (hold funds until delivery confirmed)
- Platform commission calculation
- Listing fees
- Multiple payment methods

### 5. **Delivery & Logistics**
- Shipping tracking
- Pickup scheduling
- Delivery confirmation
- Inspection periods
- Removal periods

### 6. **Dispute Resolution**
- File disputes
- Evidence upload
- Admin resolution
- Status tracking

### 7. **Shopping Cart**
- Add auction items
- Add buy-now items
- Quantity management
- Checkout process

### 8. **User Account**
- Profile editing
- Payment methods
- Notification preferences
- Order history
- Bid history
- Selling history

### 9. **Admin Dashboard**
- User management
- Auction approval
- Dispute resolution
- Platform statistics
- Content moderation

---

## 🎨 UI/UX Features

### Components
- **shadcn/ui** component library
- Responsive design
- Dark/light mode support
- Toast notifications (Sonner)
- Form validation (React Hook Form + Zod)
- Data tables
- Dialogs/Modals
- Carousels
- Charts (Recharts)

### Pages
1. Home - Hero, featured auctions, stats, testimonials
2. Auction Shop - Browse all auctions
3. Buy Now - Direct purchase items
4. Lot Detail - Individual auction item
5. Sell - Create auction/consignment
6. Consignment - Submit items for consignment
7. Cart - Shopping cart
8. Account - User dashboard
9. Login/Register - Authentication
10. Admin Dashboard - Platform management
11. About, How It Works, Help Center, etc.

---

## 🔌 Supabase Edge Functions

1. **admin-users** - User management
2. **attach-payment-method** - Stripe payment method
3. **calculate-listing-fee** - Fee calculation
4. **create-payment** - Process payments
5. **create-paypal-payment** - PayPal integration
6. **create-setup-intent** - Stripe setup
7. **create-square-payment** - Square integration
8. **verify-and-activate-listing** - Activate after payment

---

## 📝 Key Differences from Current Platform

### Current Platform (Express + MongoDB)
- Express.js backend
- MongoDB database
- JWT authentication
- Manual file uploads
- Basic cart/wishlist

### Reference Platform (Supabase)
- Supabase backend (serverless)
- PostgreSQL database
- Supabase Auth
- Supabase Storage
- Advanced features (escrow, disputes, delivery tracking)

---

## 🚀 Implementation Priority

### Phase 1: Core Migration
1. ✅ Convert to TypeScript
2. ✅ Integrate Supabase
3. ✅ Migrate authentication
4. ✅ Update database schema

### Phase 2: Feature Parity
1. Auction shop system
2. Consignment workflow
3. Payment escrow
4. Delivery tracking
5. Dispute system

### Phase 3: Advanced Features
1. Admin dashboard
2. Notification system
3. Analytics
4. Multi-payment gateways

---

## 📦 Dependencies to Add

```json
{
  "@supabase/supabase-js": "^2.76.1",
  "@tanstack/react-query": "^5.56.2",
  "@stripe/react-stripe-js": "^4.0.2",
  "@stripe/stripe-js": "^7.9.0",
  "react-hook-form": "^7.53.0",
  "zod": "^3.23.8",
  "date-fns": "^3.6.0",
  "recharts": "^2.12.7",
  "sonner": "^1.5.0"
}
```


