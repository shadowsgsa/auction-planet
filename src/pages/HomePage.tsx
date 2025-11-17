import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowRight, TrendingUp, Shield, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuctionCard from '@/components/AuctionCard';
import HowItWorks from '@/components/HowItWorks';
import AnimatedCounter from '@/components/AnimatedCounter';
import luxuryWatch from '../assets/luxury-watch.png';
import modernTreadmill from '../assets/modern-treadmill.png';
// Using uploaded images directly
const boxingEquipment = '/lovable-uploads/692929ac-e061-4a24-9add-0958ff6b7f40.png';
const hummerVehicle = '/lovable-uploads/1461040e-86e4-465e-8ac4-faafd69d8d4a.png';
const exerciseEquipment = '/lovable-uploads/52d4fc19-f632-4b11-9037-34cff1cf7bf0.png';
import { supabase } from '@/integrations/supabase/client';

// Static direct sale items for now
const directSaleItems = [
  
  {
    id: '6',
    title: 'Designer Handbag Collection',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
    currentBid: 899,
    timeLeft: 'Buy Now',
    buyNowPrice: 899,
    category: 'Fashion'
  }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Art Collector",
    content: "Found amazing pieces at great prices. The bidding process is transparent and exciting!",
    rating: 5
  },
  {
    name: "Mike Chen",
    role: "Watch Enthusiast",
    content: "Sold my vintage collection here. Professional service and excellent buyer protection.",
    rating: 5
  },
  {
    name: "Emma Davis",
    role: "Antique Dealer",
    content: "Both buying and selling here has been seamless. Great platform for serious collectors.",
    rating: 5
  },
  
];

type AuctionItem = {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  timeLeft: string;
  category: string;
};

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredAuctions, setFeaturedAuctions] = useState<AuctionItem[]>([]);

  useEffect(() => {
  fetchAuctionItems();
}, []);  // ← THIS FIXES THE BLANK PAGE


  const fetchAuctionItems = async () => {
    try {
      console.log('HomePage: Fetching auction items...');
      const { data: auctionItems, error } = await supabase
        .from('auction_items')
        .select('*')
        .eq('status', 'active')
        .eq('consignment_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error('HomePage: Error fetching auction items:', error);
        return;
      }

      console.log('HomePage: Raw auction data:', auctionItems);

      const formattedItems = auctionItems.map(item => {
        // For demo purposes, extend ended auctions by 3 days
        const now = new Date().getTime();
const end = item.end_time ? new Date(item.end_time).getTime() : null;
        const timeLeft = end > now ? calculateTimeLeft(item.end_time) : calculateExtendedTimeLeft();
        
        return {
          id: item.id,
          title: item.title,
          image: item.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
          currentBid: item.current_price,
          timeLeft: timeLeft,
          category: item.category || 'Auction'
        };
      });

      console.log('HomePage: Formatted items:', formattedItems);
      setFeaturedAuctions(formattedItems);
    } catch (error) {
      console.error('HomePage: Error in fetchAuctionItems:', error);
    }
  };

  const calculateExtendedTimeLeft = () => {
    // Return realistic time for demo
    const timeOptions = ["2d 14h 32m", "1d 8h 45m", "3d 2h 15m", "4h 23m"];
    return timeOptions[Math.floor(Math.random() * timeOptions.length)];
  };

  const calculateTimeLeft = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleExploreAuctions = () => {
    navigate('/auctions');
  };

  const handleStartSelling = () => {
    navigate('/sell');
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-br from-blue-500 to-blue-700 overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 opacity-60">
            <img 
              src={boxingEquipment} 
              alt="Boxing Equipment" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 opacity-60">
            <img 
              src={hummerVehicle} 
              alt="Hummer Vehicle" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 opacity-60">
            <img 
              src={exerciseEquipment} 
              alt="Exercise Equipment" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 opacity-60">
            <img 
              src={luxuryWatch} 
              alt="Luxury Watch" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 opacity-60">
            <img 
              src={modernTreadmill} 
              alt="Modern Treadmill" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Lighter Blue Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-blue-700/40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-center md:text-left max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Start Bidding or Buy Now
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Discover unique items, bid on auctions, or buy instantly. 
              Join thousands of buyers and sellers on the world's leading auction platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="text-lg px-8 py-4" onClick={handleExploreAuctions}>
                Explore Auctions
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-white/10 border-white text-white hover:bg-white hover:text-blue-800" onClick={handleStartSelling}>
                Start Selling
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                <AnimatedCounter end={2.5} decimals={1} suffix="M+" />
              </div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                <AnimatedCounter end={500} suffix="K+" />
              </div>
              <div className="text-muted-foreground">Items Sold</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                <AnimatedCounter end={2.8} decimals={1} prefix="$" suffix="B" />
              </div>
              <div className="text-muted-foreground">Total Sales</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                <AnimatedCounter end={99.8} decimals={1} suffix="%" />
              </div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Featured Auctions</h2>
              <p className="text-lg text-muted-foreground">Live and ending soon</p>
            </div>
            <Button variant="outline" onClick={handleExploreAuctions}>
              View All Auctions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAuctions.map((auction) => (
              <AuctionCard key={auction.id} {...auction} />
            ))}
          </div>
        </div>
      </section>

      {/* Direct Sale Items */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Direct Sale Items</h2>
              <p className="text-lg text-muted-foreground">Buy instantly with fixed prices</p>
            </div>
            <Button variant="outline" onClick={handleExploreAuctions}>
              View All Items
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {directSaleItems.map((item) => (
              <div key={item.id} className="lg:col-span-3">
                <AuctionCard {...item} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Auction Planet?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the perfect blend of traditional auctions and modern e-commerce
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-card">
              <Shield className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Secure & Verified</h3>
              <p className="text-muted-foreground">All users verified, payments protected, and transactions secured</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Best Prices</h3>
              <p className="text-muted-foreground">Competitive bidding and fair market pricing for all items</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card">
              <Clock className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">24/7 Support</h3>
              <p className="text-muted-foreground">Round-the-clock customer service and dispute resolution</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What Our Users Say</h2>
            <p className="text-lg text-muted-foreground">Join thousands of satisfied buyers and sellers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card p-6 rounded-lg shadow-card">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-accent fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join Auction Planet today and discover amazing deals or turn your items into cash
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="bg-background text-primary hover:bg-background/90" onClick={handleExploreAuctions}>
              Start Bidding Now
            </Button>
            <Button variant="hero" size="lg" className="bg-background text-primary hover:bg-background/90" onClick={handleGetStarted}>
              List Your First Item
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
