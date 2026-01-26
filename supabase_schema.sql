-- =====================================================
-- AUCTION PLATFORM - SUPABASE DATABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',
  user_type TEXT CHECK (user_type IN ('buyer', 'seller', 'both')) DEFAULT 'buyer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. USER ROLES TABLE
-- =====================================================
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- 3. AUCTION SHOP TABLE
-- =====================================================
CREATE TABLE auction_shop (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shopowner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Shop Address
  shop_address_line1 TEXT,
  shop_address_line2 TEXT,
  shop_city TEXT,
  shop_state TEXT,
  shop_zip TEXT,
  shop_country TEXT DEFAULT 'USA',
  
  -- Shipping Contact
  shipping_contact_name TEXT,
  shipping_contact_phone TEXT,
  
  -- Shipping Options
  standard_shipping DECIMAL(10, 2),
  expedited_shipping DECIMAL(10, 2),
  overnight_shipping DECIMAL(10, 2),
  
  -- Payment & Terms
  payment_terms TEXT,
  terms TEXT,
  
  -- Tax Rates
  state_tax_rate DECIMAL(5, 2) DEFAULT 0,
  city_tax_rate DECIMAL(5, 2) DEFAULT 0,
  country_tax_rate DECIMAL(5, 2) DEFAULT 0,
  misc_tax_rate DECIMAL(5, 2) DEFAULT 0,
  transport_excise_tax_rate DECIMAL(5, 2) DEFAULT 0,
  total_tax DECIMAL(5, 2) DEFAULT 0,
  
  -- Inspection & Removal Periods
  inspection_start TIMESTAMPTZ,
  inspection_end TIMESTAMPTZ,
  removal_start TIMESTAMPTZ,
  removal_end TIMESTAMPTZ,
  
  -- Fees & Commission
  listing_fee DECIMAL(10, 2) DEFAULT 0,
  listing_fee_paid BOOLEAN DEFAULT FALSE,
  commission_rate DECIMAL(5, 2) DEFAULT 10,
  
  -- Status
  consignment_status TEXT CHECK (consignment_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. LOTS TABLE (Individual auction items within a shop)
-- =====================================================
CREATE TABLE lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID REFERENCES auction_shop(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  condition TEXT CHECK (condition IN ('new', 'like-new', 'good', 'fair', 'poor')),
  
  -- Pricing
  starting_bid DECIMAL(10, 2) NOT NULL,
  highest_bid DECIMAL(10, 2) DEFAULT 0,
  highest_bidder_id UUID REFERENCES auth.users(id),
  buy_now_price DECIMAL(10, 2),
  reserve_price DECIMAL(10, 2),
  
  -- Timing
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Media
  image_urls TEXT[],
  
  -- Logistics
  location TEXT,
  shipping_cost DECIMAL(10, 2),
  shipping_option TEXT CHECK (shipping_option IN ('shipping', 'pickup', 'both')) DEFAULT 'both',
  
  -- Quantity
  quantity INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. AUCTION ITEMS TABLE (Standalone auction items)
-- =====================================================
CREATE TABLE auction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES auth.users(id),
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  condition TEXT CHECK (condition IN ('new', 'like-new', 'good', 'fair', 'poor')),
  
  -- Pricing
  starting_price DECIMAL(10, 2) NOT NULL,
  current_price DECIMAL(10, 2) DEFAULT 0,
  reserve_price DECIMAL(10, 2),
  buy_now_price DECIMAL(10, 2),
  
  -- Timing
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ NOT NULL,
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'active', 'ended', 'sold', 'cancelled')) DEFAULT 'pending',
  consignment_status TEXT CHECK (consignment_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  
  -- Media
  image_url TEXT,
  images TEXT[],
  
  -- Fees & Commission
  listing_fee DECIMAL(10, 2) DEFAULT 0,
  listing_fee_paid BOOLEAN DEFAULT FALSE,
  commission_rate DECIMAL(5, 2) DEFAULT 10,
  
  -- Inspection & Removal
  inspection_start TIMESTAMPTZ,
  inspection_end TIMESTAMPTZ,
  removal_start TIMESTAMPTZ,
  removal_end TIMESTAMPTZ,
  
  -- Payment
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
  auction_completed_at TIMESTAMPTZ,
  
  -- Quantity
  quantity INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. BIDS TABLE
-- =====================================================
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_item_id UUID REFERENCES auction_items(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
  bidder_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CHECK (
    (auction_item_id IS NOT NULL AND lot_id IS NULL) OR
    (auction_item_id IS NULL AND lot_id IS NOT NULL)
  )
);


