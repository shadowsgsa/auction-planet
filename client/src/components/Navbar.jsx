import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, LogIn } from 'lucide-react';

import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Auction Planet</span>
        </Link>

        <ul className="navbar-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/auctions">Auctions</Link></li>
          <li><Link to="/buy-now">Buy Now</Link></li>
          <li><Link to="/sell-item">Sell Item</Link></li>
          <li><Link to="/consignment">Consignment</Link></li>
          <li><Link to="/my-account">My Account</Link></li>
          {user?.role === 'admin' && (
            <li><Link to="/admin" className="admin-link">Admin Panel</Link></li>
          )}
        </ul>

        <div className="navbar-right">
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="cart-btn" title="Shopping Cart">
                <div className="cart-icon">
                  <ShoppingCart size={18} color="black" />
                  {getCartCount() > 0 && (
                    <span className="cart-badge">{getCartCount()}</span>
                  )}
                </div>
              </Link>

              <span className="user-email">{user?.email}</span>
              <button onClick={handleLogout} className="logout-btn">
                <span className="logout-icon d-flex align-items-center">
                   <LogOut size={15} color="white" />
                </span>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <button className="d-flex align-items-center gap-3 btn border border-gray text-dark px-3 py-1 hover-bg-warning custom-hover">
                   <LogIn size={16} color="black" />
                  Login
                </button>
              </Link>
              <Link to="/register" className="nav-link">
                <button className="btn btn-primary  px-3 py-1 hover-bg-warning ">
                  Register
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
