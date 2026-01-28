import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://www.theauctionplanet.com/api';
// const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Auctions API
export const auctionsAPI = {
  getAll: (params) => api.get('/auctions', { params }),
  getById: (id) => api.get(`/auctions/${id}`),
  create: (data) => api.post('/auctions', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => api.put(`/auctions/${id}`, data),
  delete: (id) => api.delete(`/auctions/${id}`),
};

// Bids API
export const bidsAPI = {
  placeBid: (data) => api.post('/bids', data),
  getAuctionBids: (auctionId, params) => api.get(`/bids/auction/${auctionId}`, { params }),
  getMyBids: (params) => api.get('/bids/my-bids', { params }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Users API
export const usersAPI = {
  getProfile: (id) => api.get(`/users/profile/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  getMyAuctions: (params) => api.get('/users/my-auctions', { params }),
  getMyWins: (params) => api.get('/users/my-wins', { params }),
};

export default api;

