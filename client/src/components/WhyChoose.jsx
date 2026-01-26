import { Shield, TrendingUp, Clock } from 'lucide-react';

const WhyChoose = () => {
    return (
        <section className="py-5 bg-light">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="fw-bold mb-3">Why Choose Auction Planet?</h2>
                    <p className="text-muted mx-auto" style={{ maxWidth: "600px" }}>
                        Experience the perfect blend of traditional auctions and modern e-commerce
                    </p>
                </div>

                <div className="row g-4">
                    <div className="col-12 col-md-4">
                        <div className="text-center p-4 bg-white rounded h-100">
                            <Shield className="text-success mb-3" size={48} />
                            <h3 className="h5 fw-semibold mb-2">Secure & Verified</h3>
                            <p className="text-muted">
                                All users verified, payments protected, and transactions secured
                            </p>
                        </div>
                    </div>

                    <div className="col-12 col-md-4">
                        <div className="text-center p-4 bg-white rounded  h-100">
                            <TrendingUp className="text-primary mb-3" size={48} />
                            <h3 className="h5 fw-semibold mb-2">Best Prices</h3>
                            <p className="text-muted">
                                Competitive bidding and fair market pricing for all items
                            </p>
                        </div>
                    </div>

                    <div className="col-12 col-md-4">
                        <div className="text-center p-4 bg-white rounded  h-100">
                            <Clock className="text-warning mb-3" size={48} />
                            <h3 className="h5 fw-semibold mb-2">24/7 Support</h3>
                            <p className="text-muted">
                                Round-the-clock customer service and dispute resolution
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default WhyChoose;