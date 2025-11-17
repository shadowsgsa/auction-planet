
import { Shield, Users, Globe, Award } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">About Auction Planet</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're revolutionizing online auctions by combining the excitement of bidding 
            with the convenience of modern e-commerce.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              To create the world's most trusted and exciting marketplace where buyers and sellers 
              can connect, discover unique items, and participate in fair, transparent auctions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Trust & Security</h3>
              <p className="text-muted-foreground">Advanced security measures protect every transaction</p>
            </div>
            <div className="text-center p-6">
              <Users className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Community</h3>
              <p className="text-muted-foreground">Building a global community of collectors and sellers</p>
            </div>
            <div className="text-center p-6">
              <Globe className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Global Reach</h3>
              <p className="text-muted-foreground">Connecting buyers and sellers worldwide</p>
            </div>
            <div className="text-center p-6">
              <Award className="h-12 w-12 text-warning mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Excellence</h3>
              <p className="text-muted-foreground">Committed to providing the best auction experience</p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2020, Auction Planet began with a simple vision: to make online auctions 
                  more accessible, secure, and enjoyable for everyone.
                </p>
                <p>
                  What started as a small team of auction enthusiasts has grown into a global platform 
                  serving millions of users worldwide. We've facilitated over $2.8 billion in sales 
                  while maintaining our commitment to transparency and fairness.
                </p>
                <p>
                  Today, we continue to innovate, adding new features and categories to serve our 
                  growing community of collectors, dealers, and casual buyers and sellers.
                </p>
              </div>
            </div>
            <div className="bg-muted/30 p-8 rounded-lg">
              <h3 className="text-xl font-semibold text-foreground mb-4">By the Numbers</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-primary">2.5M+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">500K+</div>
                  <div className="text-sm text-muted-foreground">Items Sold</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">$2.8B</div>
                  <div className="text-sm text-muted-foreground">Total Sales</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">99.8%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
