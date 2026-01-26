import { Link } from 'react-router-dom';
import { Gavel, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-3">
      <div className="container">
        <div className="row gy-4">
          {/* Brand Section */}
          <div className="col-12 col-md-6">
            <div className="d-flex align-items-center mb-3">
              <Gavel className="me-2" size={32} color="#ffc107" />
              <span className="h5 mb-0 fw-bold">Auction Planet</span>
            </div>
            <p className="text-light-50 mb-3" style={{ maxWidth: "400px" }}>
              The world's leading integrated auction and e-commerce platform.
              Buy, sell, and bid on thousands of items with confidence.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-light text-decoration-none hover-warning">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-light text-decoration-none hover-warning">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-light text-decoration-none hover-warning">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-3">
            <h5 className="fw-semibold mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/about" className="text-white text-decoration-none">About Us</Link>
              </li>
              <li className="mb-2">
                <Link to="/how-it-works" className="text-white text-decoration-none">How It Works</Link>
              </li>
              <li className="mb-2">
                <Link to="/seller-guide" className="text-white text-decoration-none">Seller Guide</Link>
              </li>
              <li className="mb-2">
                <Link to="/buyer-protection" className="text-white text-decoration-none">Buyer Protection</Link>
              </li>
              <li className="mb-2">
                <Link to="/help" className="text-white text-decoration-none">Help Center</Link>
              </li>
              </ul>
          </div>

          {/* Legal & Contact */}
          <div className="col-6 col-md-3">
            <h5 className="fw-semibold mb-3">Legal & Contact</h5>
            <ul className="list-unstyled mb-3">
              <li className="mb-2">
                <Link to="/terms" className="text-white text-decoration-none hover-warning">Terms of Service</Link>
              </li>
              <li className="mb-2">
                <Link to="/privacy" className="text-white text-decoration-none hover-warning">Privacy Policy</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-white text-decoration-none hover-warning">Contact Us</Link>
              </li>
            </ul>

            <div className="d-flex flex-column gap-2">
              <div className="d-flex align-items-center text-light-50">
                <Mail size={16} className="me-2" />
                <span className="small">support@auctionplanet.com</span>
              </div>
              <div className="d-flex align-items-center text-light-50">
                <Phone size={16} className="me-2" />
                <span className="small">1-800-AUCTION</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-light mt-4" />

        <div className="text-center mt-3">
          <p className="text-light-50 small mb-0">
            © 2024 Auction Planet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
