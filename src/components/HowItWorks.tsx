import { UserPlus, Search, CreditCard } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: "Register",
    description: "Create your account as a buyer or seller in just minutes"
  },
  {
    icon: Search,
    title: "Post or Buy",
    description: "List items for auction or browse thousands of products"
  },
  {
    icon: CreditCard,
    title: "Pay Securely",
    description: "Complete transactions with our secure payment system"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started with Auction Planet in three simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-6">
                <step.icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;