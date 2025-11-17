import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Menu, 
  X, 
  Gavel, 
  ShoppingCart, 
  LogIn,
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useCart } from '@/hooks/useCart';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  const { getItemCount } = useCart();

  console.log('Header render - user:', user?.email, 'isAdmin:', isAdmin, 'adminLoading:', adminLoading);

  const handleSignOut = async () => {
    console.log('Header - handleSignOut called, user:', user?.email);
    try {
      await signOut();
      console.log('Header - signOut completed');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Header - signOut error:', error);
      // Force cleanup even on error
      setIsMenuOpen(false);
      window.location.href = '/';
    }
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Gavel className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Auction Planet</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/auction-shop" className="text-foreground hover:text-primary transition-colors">
              Auctions
            </Link>
            <Link to="/buy-now" className="text-foreground hover:text-primary transition-colors">
              Buy Now
            </Link>
            <Link to="/sell" className="text-foreground hover:text-primary transition-colors">
              Sell Item
            </Link>
            <Link to="/consignment" className="text-foreground hover:text-primary transition-colors">
              Consignment
            </Link>
            {user && (
              <Link to="/account" className="text-foreground hover:text-primary transition-colors">
                My Account
              </Link>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {getItemCount() > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center">
                    {getItemCount()}
                  </Badge>
                )}
              </Button>
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                {isAdmin && (
                  <Link to="/admin/dashboard">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/auctions" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Auctions
              </Link>
              <Link 
                to="/buy-now" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Buy Now
              </Link>
              <Link 
                to="/sell" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sell Item
              </Link>
              <Link 
                to="/consignment" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Consignment
              </Link>
              {user && (
                <Link 
                  to="/account" 
                  className="text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Account
                </Link>
              )}
              <div className="flex flex-col space-y-2 pt-4">
                {user ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground px-2">
                      {user.email}
                    </p>
                    {isAdmin && (
                      <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Button>
                      </Link>
                    )}
                    <Button variant="outline" className="w-full" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        <LogIn className="h-4 w-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full">Register</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;