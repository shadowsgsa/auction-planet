import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './AdminManagement.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const DisputesManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchDisputes();
  }, [user, navigate, page, statusFilter, priorityFilter]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/disputes`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, status: statusFilter, priority: priorityFilter }
      });
      setDisputes(response.data.disputes);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (disputeId) => {
    const resolution = prompt('Enter resolution details:');
    if (!resolution) return;

    const refundAmount = prompt('Refund amount (leave empty for no refund):');
    const refundTo = refundAmount ? prompt('Refund to (buyer/seller):') : null;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/disputes/${disputeId}/resolve`,
        { resolution, refundAmount: refundAmount ? parseFloat(refundAmount) : null, refundTo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDisputes();
      alert('Dispute resolved successfully');
    } catch (error) {
      console.error('Error resolving dispute:', error);
      alert('Failed to resolve dispute');
    }
  };

  return (
    <div className="admin-management">
      <div className="admin-container">
        <div className="management-header">
          <button className="back-btn" onClick={() => navigate('/admin')}>
            ← Back to Dashboard
          </button>
          <h1>Disputes Management</h1>
        </div>

        {/* Filters */}
        <div className="filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="filter-select">
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Disputes Table */}
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Filed By</th>
                    <th>Against</th>
                    <th>Item/Lot</th>
                    <th>Reason</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {disputes.map((dispute) => (
                    <tr key={dispute._id}>
                      <td>
                        {dispute.filedBy?.name}
                        <br />
                        <small>{dispute.filedBy?.email}</small>
                      </td>
                      <td>
                        {dispute.againstUser?.name}
                        <br />
                        <small>{dispute.againstUser?.email}</small>
                      </td>
                      <td>
                        {dispute.auctionItem?.title || dispute.lot?.title || 'N/A'}
                        <br />
                        <small>{dispute.lot?.lotNumber || ''}</small>
                      </td>
                      <td>{dispute.reason}</td>
                      <td>
                        <span className={`badge badge-${dispute.priority}`}>{dispute.priority}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${dispute.status}`}>{dispute.status}</span>
                      </td>
                      <td>{new Date(dispute.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                            <button onClick={() => handleResolve(dispute._id)} className="btn-success">
                              Resolve
                            </button>
                          )}
                          <button onClick={() => navigate(`/disputes/${dispute._id}`)} className="btn-info">
                            View
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

export default DisputesManagement;

