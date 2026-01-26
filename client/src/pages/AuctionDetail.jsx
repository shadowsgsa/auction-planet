import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { auctionsAPI, bidsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AuctionDetail.css';

const AuctionDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    loadAuction();
    
    // Setup socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [id]);

  useEffect(() => {
    if (socket && auction) {
      socket.emit('joinAuction', auction._id);

      socket.on('newBid', (data) => {
        if (data.auction.id === auction._id) {
          setAuction((prev) => ({
            ...prev,
            currentPrice: data.auction.currentPrice,
            totalBids: data.auction.totalBids,
          }));
          setBids((prev) => [data.bid, ...prev]);
        }
      });

      return () => {
        socket.emit('leaveAuction', auction._id);
        socket.off('newBid');
      };
    }
  }, [socket, auction]);

  const loadAuction = async () => {
    try {
      const response = await auctionsAPI.getById(id);
      setAuction(response.data.auction);
      setBids(response.data.bids);
      setBidAmount(response.data.auction.currentPrice + response.data.auction.bidIncrement);
    } catch (error) {
      console.error('Failed to load auction:', error);
      setError('Failed to load auction');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      setError('Please login to place a bid');
      return;
    }

    try {
      await bidsAPI.placeBid({
        auctionId: auction._id,
        amount: parseFloat(bidAmount),
      });
      setBidAmount(auction.currentPrice + auction.bidIncrement);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to place bid');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!auction) return <div className="error">Auction not found</div>;

  const imageUrl = auction.images?.[0]
    ? `http://localhost:5000/uploads/${auction.images[0]}`
    : 'https://via.placeholder.com/600x400?text=No+Image';

  return (
    <div className="auction-detail-page">
      <div className="container">
        <div className="auction-detail">
          <div className="auction-images">
            <img src={imageUrl} alt={auction.title} className="main-image" />
          </div>

          <div className="auction-info-section">
            <h1>{auction.title}</h1>
            <p className="category">{auction.category?.name}</p>
            
            <div className="price-section">
              <div className="current-price">
                <span className="label">Current Bid:</span>
                <span className="price">${auction.currentPrice}</span>
              </div>
              <div className="bid-info">
                <span>{auction.totalBids} bids</span>
              </div>
            </div>

            {auction.status === 'active' && isAuthenticated && (
              <form onSubmit={handlePlaceBid} className="bid-form">
                <div className="form-group">
                  <label>Your Bid (Min: ${auction.currentPrice + auction.bidIncrement})</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min={auction.currentPrice + auction.bidIncrement}
                    step={auction.bidIncrement}
                    required
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" className="btn btn-primary btn-large">
                  Place Bid
                </button>
              </form>
            )}

            <div className="auction-details">
              <h3>Details</h3>
              <p>{auction.description}</p>
              <div className="detail-item">
                <strong>Condition:</strong> {auction.condition}
              </div>
              <div className="detail-item">
                <strong>Location:</strong> {auction.location || 'Not specified'}
              </div>
              <div className="detail-item">
                <strong>Shipping:</strong> {auction.shippingAvailable ? 'Available' : 'Not available'}
              </div>
              <div className="detail-item">
                <strong>Seller:</strong> {auction.seller?.name}
              </div>
            </div>
          </div>
        </div>

        <div className="bids-section">
          <h2>Bid History</h2>
          {bids.length === 0 ? (
            <p>No bids yet. Be the first to bid!</p>
          ) : (
            <div className="bids-list">
              {bids.map((bid) => (
                <div key={bid._id} className="bid-item">
                  <span className="bidder">{bid.bidder?.name}</span>
                  <span className="amount">${bid.amount}</span>
                  <span className="time">{new Date(bid.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;

