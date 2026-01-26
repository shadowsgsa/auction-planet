import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI, bidsAPI } from '../services/api';
import AuctionCard from '../components/AuctionCard';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('myAuctions');
  const [myAuctions, setMyAuctions] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [myWins, setMyWins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'myAuctions') {
        const response = await usersAPI.getMyAuctions();
        setMyAuctions(response.data.auctions);
      } else if (activeTab === 'myBids') {
        const response = await bidsAPI.getMyBids();
        setMyBids(response.data.bids);
      } else if (activeTab === 'myWins') {
        const response = await usersAPI.getMyWins();
        setMyWins(response.data.auctions);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>My Dashboard</h1>

        <div className="dashboard-tabs">
          <button
            className={`tab ${activeTab === 'myAuctions' ? 'active' : ''}`}
            onClick={() => setActiveTab('myAuctions')}
          >
            My Auctions
          </button>
          <button
            className={`tab ${activeTab === 'myBids' ? 'active' : ''}`}
            onClick={() => setActiveTab('myBids')}
          >
            My Bids
          </button>
          <button
            className={`tab ${activeTab === 'myWins' ? 'active' : ''}`}
            onClick={() => setActiveTab('myWins')}
          >
            My Wins
          </button>
        </div>

        <div className="dashboard-content">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              {activeTab === 'myAuctions' && (
                <div className="my-auctions">
                  <div className="section-header">
                    <h2>My Auctions</h2>
                    <Link to="/create-auction" className="btn btn-primary">
                      Create New Auction
                    </Link>
                  </div>
                  {myAuctions.length === 0 ? (
                    <p>You haven't created any auctions yet.</p>
                  ) : (
                    <div className="auction-grid">
                      {myAuctions.map((auction) => (
                        <AuctionCard key={auction._id} auction={auction} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'myBids' && (
                <div className="my-bids">
                  <h2>My Bids</h2>
                  {myBids.length === 0 ? (
                    <p>You haven't placed any bids yet.</p>
                  ) : (
                    <div className="bids-list">
                      {myBids.map((bid) => (
                        <div key={bid._id} className="bid-card">
                          <Link to={`/auctions/${bid.auction._id}`}>
                            <h3>{bid.auction.title}</h3>
                          </Link>
                          <div className="bid-details">
                            <span>Your Bid: ${bid.amount}</span>
                            <span>Current Price: ${bid.auction.currentPrice}</span>
                            <span className={bid.amount >= bid.auction.currentPrice ? 'winning' : 'losing'}>
                              {bid.amount >= bid.auction.currentPrice ? 'Winning' : 'Outbid'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'myWins' && (
                <div className="my-wins">
                  <h2>My Wins</h2>
                  {myWins.length === 0 ? (
                    <p>You haven't won any auctions yet.</p>
                  ) : (
                    <div className="auction-grid">
                      {myWins.map((auction) => (
                        <AuctionCard key={auction._id} auction={auction} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

