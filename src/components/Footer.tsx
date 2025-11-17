import { Link } from 'react-router-dom';
import { Gavel, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Gavel className="h-8 w-8 text-accent" />
              <span className="text-xl font-bold">Auction Planet</span>
            </div>
            <p className="text-background/80 mb-6 max-w-md">
              The world's leading integrated auction and e-commerce platform. 
              Buy, sell, and bid on thousands of items with confidence.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-background/60 hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-background/80 hover:text-accent transition-colors">
                About Us
              </Link>
              <Link to="/how-it-works" className="block text-background/80 hover:text-accent transition-colors">
                How It Works
              </Link>
              <Link to="/seller-guide" className="block text-background/80 hover:text-accent transition-colors">
                Seller Guide
              </Link>
              <Link to="/buyer-protection" className="block text-background/80 hover:text-accent transition-colors">
                Buyer Protection
              </Link>
              <Link to="/help" className="block text-background/80 hover:text-accent transition-colors">
                Help Center
              </Link>
            </div>
          </div>
          
          {/* Legal & Contact */}
          <div>
            <h4 className="font-semibold mb-4">Legal & Contact</h4>
            <div className="space-y-2">
              <Link to="/terms" className="block text-background/80 hover:text-accent transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="block text-background/80 hover:text-accent transition-colors">
                Privacy Policy
              </Link>
              <Link to="/contact" className="block text-background/80 hover:text-accent transition-colors">
                Contact Us
              </Link>
            </div>
            
            <div className="mt-6 space-y-2">
              <div className="flex items-center text-background/80">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">support@auctionplanet.com</span>
              </div>
              <div className="flex items-center text-background/80">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm">1-800-AUCTION</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-background/20 mt-8 pt-8 text-center">
          <p className="text-background/60 text-sm">
            © 2024 Auction Planet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;