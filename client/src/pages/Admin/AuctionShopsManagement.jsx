import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './AdminManagement.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AuctionShopsManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchShops();
  }, [user, navigate, page, search, statusFilter]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/auction-shops`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, search, status: statusFilter }
      });
      setShops(response.data.shops);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (shopId) => {
    if (!confirm('Are you sure you want to approve this auction shop?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/admin/auction-shops/${shopId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchShops();
      alert('Shop approved successfully');
    } catch (error) {
      console.error('Error approving shop:', error);
      alert('Failed to approve shop');
    }
  };

  const handleReject = async (shopId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/admin/auction-shops/${shopId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchShops();
      alert('Shop rejected');
    } catch (error) {
      console.error('Error rejecting shop:', error);
      alert('Failed to reject shop');
    }
  };

  const handleDelete = async (shopId) => {
    if (!confirm('Are you sure you want to delete this shop? This will also delete all its lots.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/auction-shops/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchShops();
      alert('Shop deleted successfully');
    } catch (error) {
      console.error('Error deleting shop:', error);
      alert('Failed to delete shop');
    }
  };

  return (
    <div className="admin-management">
      <div className="admin-container">
        <div className="management-header">
          <button className="back-btn" onClick={() => navigate('/admin')}>
            ← Back to Dashboard
          </button>
          <h1>Auction Shops Management</h1>
        </div>

        {/* Filters */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search shops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
            <option value="ended">Ended</option>
          </select>
        </div>

        {/* Shops Table */}
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Commission</th>
                    <th>Total Lots</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map((shop) => (
                    <tr key={shop._id}>
                      <td>
                        <strong>{shop.title}</strong>
                        <br />
                        <small>{shop.description?.substring(0, 50)}...</small>
                      </td>
                      <td>
                        {shop.shopOwner?.name}
                        <br />
                        <small>{shop.shopOwner?.email}</small>
                      </td>
                      <td>
                        <span className={`badge badge-${shop.status}`}>{shop.status}</span>
                      </td>
                      <td>{shop.commissionRate}%</td>
                      <td>{shop.totalLots || 0}</td>
                      <td>{new Date(shop.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          {shop.status === 'pending' && (
                            <>
                              <button onClick={() => handleApprove(shop._id)} className="btn-success">
                                Approve
                              </button>
                              <button onClick={() => handleReject(shop._id)} className="btn-warning">
                                Reject
                              </button>
                            </>
                          )}
                          <button onClick={() => navigate(`/auction-shops/${shop._id}`)} className="btn-info">
                            View
                          </button>
                          <button onClick={() => handleDelete(shop._id)} className="btn-danger">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuctionShopsManagement;

