import { Link } from 'react-router-dom';
import './AuctionCard.css';

const AuctionCard = ({ auction }) => {
  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(auction.endTime);
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const imageUrl = auction.images?.[0]
    ? `http://localhost:5000/uploads/${auction.images[0]}`
    : 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <Link to={`/auctions/${auction._id}`} className="auction-card">
      <div className="auction-image">
        <img src={imageUrl} alt={auction.title} />
        <span className={`status-badge ${auction.status}`}>
          {auction.status}
        </span>
      </div>
      <div className="auction-content">
        <h3 className="auction-title">{auction.title}</h3>
        <p className="auction-category">{auction.category?.name}</p>
        <div className="auction-info">
          <div className="price-info">
            <span className="label">Current Bid:</span>
            <span className="price">${auction.currentPrice}</span>
          </div>
          <div className="time-info">
            <span className="label">Time Left:</span>
            <span className="time">{getTimeRemaining()}</span>
          </div>
        </div>
        <div className="auction-stats">
          <span>{auction.totalBids} bids</span>
        </div>
      </div>
    </Link>
  );
};

export default AuctionCard;

