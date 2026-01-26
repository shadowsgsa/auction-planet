import { useState, useEffect } from 'react';
import { auctionsAPI, categoriesAPI } from '../services/api';
import AuctionCard from '../components/AuctionCard';
import './AuctionList.css';

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    status: 'active',
    search: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadAuctions();
  }, [filters, pagination.currentPage]);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadAuctions = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.currentPage,
        limit: 12,
      };
      const response = await auctionsAPI.getAll(params);
      console.log("fetch auctions" , response);
      setAuctions(response.data.auctions);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
      });
    } catch (error) {
      console.error('Failed to load auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadAuctions();
  };

  return (
    <div className="auction-list-page">
      <h1>Browse Auctions</h1>
      <div className="container-fluid d-flex justify-between">

        <div className="filters-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              name="search"
              placeholder="Search auctions..."
              value={filters.search}
              onChange={handleFilterChange}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="filters">
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="active">Active</option>
              <option value="pending">Upcoming</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading auctions...</div>
        ) : auctions.length === 0 ? (
          <div className="no-results">No auctions found</div>
        ) : (
          <>
            <div className="auction-grid">
              {auctions.map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                  disabled={pagination.currentPage === 1}
                  className="btn"
                >
                  Previous
                </button>
                <span>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuctionList;

