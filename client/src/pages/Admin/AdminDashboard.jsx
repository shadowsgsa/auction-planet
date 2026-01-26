import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your auction platform</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{stats?.totalUsers || 0}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔨</div>
            <div className="stat-content">
              <h3>{stats?.totalAuctions || 0}</h3>
              <p>Total Auctions</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏪</div>
            <div className="stat-content">
              <h3>{stats?.totalShops || 0}</h3>
              <p>Auction Shops</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>{stats?.totalLots || 0}</h3>
              <p>Total Lots</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-content">
              <h3>{stats?.totalOrders || 0}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="stat-card highlight">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>${(stats?.totalRevenue || 0).toLocaleString()}</h3>
              <p>Total Revenue</p>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{stats?.pendingShops || 0}</h3>
              <p>Pending Shops</p>
            </div>
          </div>

          <div className="stat-card alert">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>{stats?.activeDisputes || 0}</h3>
              <p>Active Disputes</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <button className="action-btn" onClick={() => navigate('/admin/users')}>
              <span className="action-icon">👥</span>
              <span>Manage Users</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/auction-shops')}>
              <span className="action-icon">🏪</span>
              <span>Manage Shops</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/auctions')}>
              <span className="action-icon">🔨</span>
              <span>Manage Auctions</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/disputes')}>
              <span className="action-icon">⚖️</span>
              <span>Manage Disputes</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/orders')}>
              <span className="action-icon">📦</span>
              <span>Manage Orders</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/products')}>
              <span className="action-icon">🛍️</span>
              <span>Manage Products</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

