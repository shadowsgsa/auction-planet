import { Star } from 'lucide-react';

const Testimonials = ({ testimonials }) => {
  return (
    <section className="py-5 bg-light">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-3">What Our Users Say</h2>
          <p className="text-muted">
            Join thousands of satisfied buyers and sellers
          </p>
        </div>

        <div className="row g-4">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="col-12 col-md-4">
              <div className="card border-0 h-100 shadow-sm p-4">
                <div className="mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="text-warning me-1" size={20} />
                  ))}
                </div>
                <p className="text-muted mb-4">"{testimonial.content}"</p>
                <div>
                  <div className="fw-semibold">{testimonial.name}</div>
                  <div className="text-muted small">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
