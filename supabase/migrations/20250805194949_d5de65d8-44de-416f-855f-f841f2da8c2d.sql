-- Insert some test auction items for testing bidding functionality
INSERT INTO auction_items (title, description, starting_price, current_price, seller_id, end_time, category, condition, image_url, status) VALUES
(
  'Vintage Rolex Submariner 1960s',
  'A rare vintage Rolex Submariner from the 1960s in excellent condition. This timepiece features the classic black dial and has been well maintained throughout its history.',
  12000,
  15000,
  (SELECT auth.uid()),
  NOW() + INTERVAL '3 days',
  'Watches',
  'Excellent',
  'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400',
  'active'
),
(
  'Antique Chinese Vase Ming Dynasty',
  'Beautiful antique Chinese vase from the Ming Dynasty period. Features intricate blue and white porcelain design with traditional motifs.',
  2000,
  2200,
  (SELECT auth.uid()),
  NOW() + INTERVAL '5 days',
  'Antiques',
  'Very Good',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
  'active'
),
(
  'Art Deco Table Lamp 1920s',
  'Stunning Art Deco table lamp from the 1920s. Bronze base with geometric patterns and original glass shade. Perfect for collectors of Art Deco pieces.',
  750,
  890,
  (SELECT auth.uid()),
  NOW() + INTERVAL '2 days',
  'Furniture',
  'Good',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  'active'
),
(
  'Vintage Camera Collection Leica',
  'Professional vintage camera collection featuring a Leica IIIf rangefinder camera with multiple lenses. Great for photography enthusiasts and collectors.',
  800,
  450,
  (SELECT auth.uid()),
  NOW() + INTERVAL '4 days',
  'Electronics',
  'Very Good',
  'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400',
  'active'
);