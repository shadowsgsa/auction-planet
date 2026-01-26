import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './MyAccount.css';

const MyAccount = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'listings', label: 'My Listings' },
    { id: 'drafts', label: 'My Drafts' },
    { id: 'auction-mgmt', label: 'Auction Mgmt' },
    { id: 'bids', label: 'My Bids' },
    { id: 'purchases', label: 'Purchases' },
    { id: 'settings', label: 'Settings' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <div className="overview-stats">
              <div className="stat-box">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>0</h3>
                  <p>Active Listings</p>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon">🔨</div>
                <div className="stat-info">
                  <h3>$0</h3>
                  <p>Total Bids</p>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon">🏆</div>
                <div className="stat-info">
                  <h3>$0</h3>
                  <p>Total Wins</p>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>$0</h3>
                  <p>Total Sales</p>
                </div>
              </div>
            </div>
            <div className="recent-activity">
              <h3>My Active Listings</h3>
              <p className="empty-state">No active listings yet.</p>
            </div>
          </div>
        );

      case 'listings':
        return (
          <div className="tab-content">
            <h2>My Listings</h2>
            <p className="subtitle">Items you've listed for sale</p>
            <div className="empty-state-container">
              <p className="empty-state">No Auctions In Drafts yet.</p>
            </div>
          </div>
        );

      case 'drafts':
        return (
          <div className="tab-content">
            <h2>My Drafts</h2>
            <p className="subtitle">Auctions In Drafts</p>
            <div className="empty-state-container">
              <p className="empty-state">No Auctions In Drafts yet.</p>
            </div>
          </div>
        );

      case 'auction-mgmt':
        return (
          <div className="tab-content">
            <h2>Auction Management</h2>
            <p className="subtitle">Manage your auctions</p>
            <div className="empty-state-container">
              <p className="empty-state">No auctions to manage.</p>
            </div>
          </div>
        );

      case 'bids':
        return (
          <div className="tab-content">
            <h2>My Bids</h2>
            <p className="subtitle">Track your bids here</p>
            <div className="empty-state-container">
              <p className="empty-state">
                No bids placed yet.{' '}
                <a href="/auctions" className="browse-link">
                  Browse auctions
                </a>
              </p>
            </div>
          </div>
        );

      case 'purchases':
        return (
          <div className="tab-content">
            <h2>Purchases</h2>
            <p className="subtitle">Your purchase history</p>
            <div className="empty-state-container">
              <p className="empty-state">No purchases yet.</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="tab-content">
            <h2>Settings</h2>
            <p className="subtitle">Manage your account settings</p>
            <div className="settings-form">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user?.email || ''} disabled />
              </div>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={user?.name || ''} disabled />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={user?.phone || ''} disabled />
              </div>
              <button className="btn-primary" disabled>
                Edit Profile (Coming Soon)
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="my-account-page">
      <div className="account-header">
        <div className="user-avatar">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="user-info">
          <h1>{user?.email}</h1>
          <div className="user-meta">
            <span className="rating">⭐ 0 (0 reviews)</span>
            <span className="verified-badge">Verified Member</span>
          </div>
        </div>
      </div>

      <div className="account-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="account-content">{renderTabContent()}</div>
    </div>
  );
};

export default MyAccount;
