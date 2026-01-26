import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

import { Eye, EyeOff, Mail, Lock, ShoppingBag, Gavel, Users } from 'lucide-react';


const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { signUp, signInWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: 'buyer'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    setLoading(true);

    const result = await register(formData);

    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Register for Auction Planet</h2>
        {error && <div className="error-message">{error}</div>}
        {/* <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone (Optional)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form> */}

        <form onSubmit={handleSubmit} className="d-grid gap-4">

          {/* First & Last Name */}
          <div className="row g-3">
            <div>
              <label htmlFor="Name" className="form-label">First Name</label>
              <input
                id="firstName"
                className="form-control"
                placeholder="John"
                value={formData.name}
                onChange={handleChange}
                name='name'
                required
              />
            </div>

          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="form-label">Email</label>
            <div className="position-relative">
              <Mail className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
              <input
                id="email"
                type="email"
                className="form-control ps-5"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                name='email'
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="form-label">Password</label>
            <div className="position-relative">
              <Lock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-control ps-5 pe-5"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                name='password'
                required
              />
              <button
                type="button"
                className="btn position-absolute top-50 end-0 translate-middle-y me-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className="position-relative">
              <Lock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="form-control ps-5 pe-5"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                name='confirmPassword'
                required
              />
              <button
                type="button"
                className="btn position-absolute top-50 end-0 translate-middle-y me-2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* User Type */}
          <div>
            <label className="form-label">I want to</label>

            {["buyer", "seller", "both"].map((type) => (
              <div
                key={type}
                className="border rounded p-3 d-flex align-items-start gap-2 cursor-pointer mb-2"
                onClick={() => setFormData({ ...formData, userType: type })}
              >
                <input
                  type="radio"
                  name="userType"
                  checked={formData.userType === type}
                  onChange={() => { }}
                />
                <div>
                  <strong>
                    {type === "buyer" && "Buy items"}
                    {type === "seller" && "Sell items"}
                    {type === "both" && "Both: Buy & Sell"}
                  </strong>
                  <div className="text-muted small">
                    {type === "buyer" && "Browse, bid, and purchase"}
                    {type === "seller" && "List items for auction or place bids"}
                    {type === "both" && "Full access to buying and selling"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Terms */}
          <div className="form-check">
            <input className="form-check-input" type="checkbox" required />
            <label className="form-check-label small text-muted">
              I agree to the{" "}
              <Link to="/terms" className="text-primary text-decoration-none">Terms of Service</Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary text-decoration-none">Privacy Policy</Link>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-lg w-100"
            disabled={loading || googleLoading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

