
import { UserPlus, Search, CreditCard, Gavel, ShoppingCart, Shield } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your free account in minutes with email verification",
    details: ["Email verification", "Profile setup", "Payment method (optional)"]
  },
  {
    icon: Search,
    title: "Explore & Discover",
    description: "Browse thousands of unique items across multiple categories",
    details: ["Advanced search filters", "Watch items", "Set alerts"]
  },
  {
    icon: Gavel,
    title: "Bid or Buy",
    description: "Place bids on auctions or buy items instantly",
    details: ["Real-time bidding", "Buy Now options", "Automatic bidding"]
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "Complete your purchase with our protected payment system",
    details: ["Multiple payment methods", "Buyer protection", "Secure checkout"]
  }
];

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">How Auction Planet Works</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get started with our simple 4-step process and join millions of satisfied users
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Steps Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
                    <step.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground mb-4">{step.description}</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {step.details.map((detail, idx) => (
                    <li key={idx}>• {detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* For Buyers Section */}
        <section className="mb-16">
          <div className="bg-card p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">For Buyers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Search className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Discover Items</h3>
                <p className="text-muted-foreground">Browse categories, use filters, and discover unique items from around the world.</p>
              </div>
              <div className="text-center">
                <Gavel className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Participate in Auctions</h3>
                <p className="text-muted-foreground">Join live auctions, place bids, and compete with other buyers for amazing deals.</p>
              </div>
              <div className="text-center">
                <Shield className="h-12 w-12 text-success mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Buy with Confidence</h3>
                <p className="text-muted-foreground">Our buyer protection program ensures safe transactions and quality guarantees.</p>
              </div>
            </div>
          </div>
        </section>

        {/* For Sellers Section */}
        <section>
          <div className="bg-muted/30 p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">For Sellers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">List Your Items</h3>
                <p className="text-muted-foreground">Create detailed listings with photos and descriptions to attract buyers.</p>
              </div>
              <div className="text-center">
                <Gavel className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Choose Your Format</h3>
                <p className="text-muted-foreground">Set up auctions with bidding or offer fixed-price "Buy Now" options.</p>
              </div>
              <div className="text-center">
                <CreditCard className="h-12 w-12 text-success mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Get Paid Securely</h3>
                <p className="text-muted-foreground">Receive payments quickly and securely through our trusted payment system.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HowItWorksPage;
