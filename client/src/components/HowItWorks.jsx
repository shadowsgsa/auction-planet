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
    <section className="py-5 bg-light">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-3">How It Works</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: "600px" }}>
            Get started with Auction Planet in three simple steps
          </p>
        </div>

        <div className="row text-center">
          {steps.map((step, index) => (
            <div key={index} className="col-12 col-md-4 mb-4">
              <div className="d-flex align-items-center justify-content-center bg-primary rounded-circle mb-3" 
                   style={{ width: "64px", height: "64px", margin: "0 auto" }}>
                <step.icon className="text-white" size={32} />
              </div>
              <h3 className="h5 fw-semibold mb-2">{step.title}</h3>
              <p className="text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
