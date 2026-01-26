import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState({ products: [], auctions: [] });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const API_URL = 'http://localhost:5000/api';


  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist({ products: [], auctions: [] });
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProductToWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/wishlist/product/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlist(response.data);
      return { success: true };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to add to wishlist' };
    }
  };

  const removeProductFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/wishlist/product/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data);
      return { success: true };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to remove from wishlist' };
    }
  };

  const addAuctionToWishlist = async (auctionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/wishlist/auction/${auctionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlist(response.data);
      return { success: true };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to add to wishlist' };
    }
  };

  const removeAuctionFromWishlist = async (auctionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/wishlist/auction/${auctionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data);
      return { success: true };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to remove from wishlist' };
    }
  };

  const isProductInWishlist = (productId) => {
    return wishlist.products.some(p => p._id === productId);
  };

  const isAuctionInWishlist = (auctionId) => {
    return wishlist.auctions.some(a => a._id === auctionId);
  };

  const value = {
    wishlist,
    loading,
    addProductToWishlist,
    removeProductFromWishlist,
    addAuctionToWishlist,
    removeAuctionFromWishlist,
    isProductInWishlist,
    isAuctionInWishlist,
    fetchWishlist
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

