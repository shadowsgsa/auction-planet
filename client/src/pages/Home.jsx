import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { auctionsAPI } from '../services/api';
import AuctionCard from '../components/AuctionCard';
import HowItWorks from '../components/HowItWorks';
import WhyChoose from '../components/WhyChoose';
import Testimonials from '../components/Testimonials';
import Cta from '../components/Cta';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart } from 'lucide-react';

import './Home.css';

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

const Home = () => {
  const [featuredAuctions, setFeaturedAuctions] = useState([]);
  const [directSaleItems, setDirectSaleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addProductToWishlist, isProductInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    loadFeaturedAuctions();
    loadDirectSaleItems();
  }, []);

  const loadFeaturedAuctions = async () => {
    try {
      const response = await auctionsAPI.getAll({ status: 'active', limit: 6 });
      setFeaturedAuctions(response.data.auctions);
    } catch (error) {
      console.error('Failed to load auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDirectSaleItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/products?limit=4`);
      setDirectSaleItems(response.data.products || []);
    } catch (error) {
      console.error('Failed to load direct sale items:', error);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }
    const result = await addToCart(productId, 1);
    if (result.success) {
      alert('Added to cart!');
    }
  };

  const handleToggleFavorite = async (productId) => {
    if (!isAuthenticated) {
      alert('Please login to add to favorites');
      return;
    }
    await addProductToWishlist(productId);
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Start Bidding or Buy Now</h1>
          <p>
            Discover unique items, bid on auctions, or buy instantly. Join thousands of
            buyers and sellers on the world's leading auction platform.
          </p>
          <div className="hero-buttons">
            <Link to="/auctions" >
              <button className='explore-btn'>
                Explore Auctions →
              </button>
            </Link>
            <Link to="/sell-item">
              <button className="selling-btn">
                Start Selling
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="statistics">
        <div className="stat-card">
          <h3>2.5M+</h3>
          <p>Active Users</p>
        </div>
        <div className="stat-card">
          <h3>500K+</h3>
          <p>Items Sold</p>
        </div>
        <div className="stat-card">
          <h3>$2.8B</h3>
          <p>Total Sales</p>
        </div>
        <div className="stat-card">
          <h3>99.8%</h3>
          <p>Success Rate</p>
        </div>
      </section>

      {/* Featured Auctions Section */}
      <section className="featured-auctions">
        <div className="section-header">
          <div>
            <h2>Featured Auctions</h2>
            <p className="section-subtitle">Live and ending soon</p>
          </div>
          <Link to="/auctions" className="view-all-link">
            <button className='btn border border-gray text-dark px-3 py-1 hover-bg-warning custom-hover'>
              View All Auctions →
            </button>
          </Link>
        </div>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="auction-grid">
            {
              featuredAuctions.length === 0 ? (
                <div className="no-items">
                  <p>No Auction available yet. Check back soon!</p>
                </div>
              ) : (
                featuredAuctions.map((auction) => (
                  <AuctionCard key={auction._id} auction={auction} />
                ))
              )}
          </div>
        )}
      </section>

      {/* Direct Sale Items Section */}
      <section className="direct-sale-items">
        <div className="section-header">
          <div>
            <h2>Direct Sale Items</h2>
            <p className="section-subtitle">Buy instantly with fixed prices</p>
          </div>
          <Link to="/buy-now" className="view-all-link">
            <button className='btn border border-gray text-dark px-3 py-1 hover-bg-warning custom-hover'>
              View All Items →
            </button>
          </Link>
        </div>
        <div className="sale-items-grid">
          {directSaleItems.length === 0 ? (
            <div className="no-items">
              <p>No products available yet. Check back soon!</p>
            </div>
          ) : (
            directSaleItems.map((item) => (
              <div key={item._id} className="sale-item-card">
                <div className="item-image-container">
                  <img
                    src={item.images?.[0] ? `http://localhost:5000/uploads/${item.images[0]}` : '/placeholder.jpg'}
                    alt={item.title}
                    className="item-image"
                  />
                  <span className="category-badge">{item.condition}</span>
                  <button
                    className={`favorite-btn ${isProductInWishlist(item._id) ? 'active' : ''}`}
                    onClick={() => handleToggleFavorite(item._id)}
                  >
                    <span className="heart-icon">{isProductInWishlist(item._id) ? '❤️' : '♡'}</span>
                  </button>
                </div>
                <div className="item-details">
                  <h3 className="item-title">{item.title}</h3>
                  <div className="item-price-row">
                    <span className="item-price">${item.price?.toFixed(2) || '0.00'}</span>
                    <span className="buy-now-badge">Buy Now</span>
                  </div>
                  <button
                    className="add-to-cart-btn btn-primary"
                    onClick={() => handleAddToCart(item._id)}
                  >
                    <span className="">
                      <ShoppingCart size={18} color="white" />
                    </span>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <HowItWorks />

      <WhyChoose />

      <Testimonials testimonials={testimonials} />

      <Cta />
      
    </div>
  );
};

export default Home;

