import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import './BuyNow.css';

const BuyNow = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  const { addToCart } = useCart();
  const { addProductToWishlist, removeProductFromWishlist, isProductInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.condition) params.append('condition', filters.condition);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`${API_URL}/products?${params}`);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }

    const result = await addToCart(productId, 1);
    if (result.success) {
      alert('Added to cart successfully!');
    } else {
      alert(result.error || 'Failed to add to cart');
    }
  };

  const handleToggleFavorite = async (productId) => {
    if (!isAuthenticated) {
      alert('Please login to add to favorites');
      return;
    }

    if (isProductInWishlist(productId)) {
      await removeProductFromWishlist(productId);
    } else {
      await addProductToWishlist(productId);
    }
  };

  return (
    <div className="buy-now-page">
      <div className="page-header">
        <h1>Buy Now - Direct Sale Items</h1>
        <p>Purchase items instantly without bidding</p>
      </div>

      <div className="buy-now-container">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <h3>Filters</h3>
          
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>Condition</label>
            <select
              value={filters.condition}
              onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
            >
              <option value="">All Conditions</option>
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
          </div>

          <button className="btn-reset" onClick={() => setFilters({
            category: '', condition: '', minPrice: '', maxPrice: '', search: ''
          })}>
            Reset Filters
          </button>
        </aside>

        {/* Products Grid */}
        <div className="products-section">
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>No products found</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product._id} className="product-card">
                  <div className="product-image">
                    <img
                      src={product.images?.[0] ? `http://localhost:5000/uploads/${product.images[0]}` : '/placeholder.jpg'}
                      alt={product.title}
                    />
                    <button
                      className={`favorite-btn ${isProductInWishlist(product._id) ? 'active' : ''}`}
                      onClick={() => handleToggleFavorite(product._id)}
                    >
                      ❤️
                    </button>
                  </div>
                  <div className="product-info">
                    <h3>{product.title}</h3>
                    <p className="product-condition">{product.condition}</p>
                    <p className="product-price">${product.price.toFixed(2)}</p>
                    <button
                      className="btn-add-cart btn-primary"
                      onClick={() => handleAddToCart(product._id)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyNow;

