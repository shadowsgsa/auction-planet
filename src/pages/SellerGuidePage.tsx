
import { Upload, Image, DollarSign, Truck, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SellerGuidePage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Seller Guide</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know to become a successful seller on Auction Planet
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Getting Started */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Upload className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Create Your Listing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Write compelling titles and descriptions that highlight key features and condition.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Image className="h-8 w-8 text-accent mb-2" />
                <CardTitle>Add Quality Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Upload clear, high-resolution images from multiple angles to showcase your item.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="h-8 w-8 text-success mb-2" />
                <CardTitle>Set Your Price</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Research similar items and choose between auction or fixed-price formats.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Listing Tips */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Listing Best Practices</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Writing Great Titles</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Include brand, model, and key features</li>
                <li>• Use specific keywords buyers search for</li>
                <li>• Mention condition (New, Used, Vintage, etc.)</li>
                <li>• Keep it under 80 characters</li>
                <li>• Avoid excessive punctuation or capitals</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-4 mt-8">Photography Tips</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Use natural lighting when possible</li>
                <li>• Include multiple angles and close-ups</li>
                <li>• Show any flaws or wear honestly</li>
                <li>• Use a clean, neutral background</li>
                <li>• Include size reference when helpful</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Pricing Strategy</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Research completed sales, not just active listings</li>
                <li>• Consider auction vs. Buy Now formats</li>
                <li>• Set competitive starting bids for auctions</li>
                <li>• Factor in shipping and fees</li>
                <li>• Use Buy Now for rare or highly desired items</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-4 mt-8">Categories & Keywords</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Choose the most specific category</li>
                <li>• Use relevant keywords in description</li>
                <li>• Include model numbers and specifications</li>
                <li>• Mention compatible items or uses</li>
                <li>• Add relevant tags and attributes</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Shipping & Fulfillment */}
        <section className="mb-16">
          <div className="bg-card p-8 rounded-lg">
            <div className="flex items-center mb-6">
              <Truck className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-3xl font-bold text-foreground">Shipping & Fulfillment</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Shipping Options</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Offer multiple shipping speeds</li>
                  <li>• Calculate accurate shipping costs</li>
                  <li>• Consider free shipping (built into item price)</li>
                  <li>• Use tracking for valuable items</li>
                  <li>• Purchase shipping insurance when appropriate</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Packaging Tips</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Use appropriate box size and padding</li>
                  <li>• Protect fragile items with bubble wrap</li>
                  <li>• Include packing slip and thank you note</li>
                  <li>• Ship within your stated handling time</li>
                  <li>• Provide tracking information promptly</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Success Metrics */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Measuring Success</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Star className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Feedback Score</h3>
              <p className="text-muted-foreground">Maintain high ratings by providing accurate descriptions and excellent service.</p>
            </div>
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Sales Performance</h3>
              <p className="text-muted-foreground">Track your sell-through rate, average sale price, and total revenue.</p>
            </div>
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Profit Margins</h3>
              <p className="text-muted-foreground">Calculate true profit after fees, shipping costs, and item acquisition.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-primary p-8 rounded-lg">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to Start Selling?</h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join thousands of successful sellers on Auction Planet
          </p>
          <Button variant="hero" size="lg" className="bg-background text-primary hover:bg-background/90">
            List Your First Item
          </Button>
        </section>
      </div>
    </div>
  );
};

export default SellerGuidePage;
