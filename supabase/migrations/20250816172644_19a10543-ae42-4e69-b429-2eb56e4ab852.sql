-- Add quantity and listing fee fields to auction_items table
ALTER TABLE public.auction_items 
ADD COLUMN quantity INTEGER DEFAULT 1,
ADD COLUMN listing_fee DECIMAL(10,2) DEFAULT 2.99,
ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 10.00,
ADD COLUMN listing_fee_paid BOOLEAN DEFAULT FALSE;