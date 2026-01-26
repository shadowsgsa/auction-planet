import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
import { Eye, EyeOff, Mail, Lock, ShoppingBag, Gavel, Users } from 'lucide-react';


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);



  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);
    localStorage.setItem('token', result.token);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      console.log(result.message)
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Login to Auction Planet</h2>
        {error && <div className="error-message">{error}</div>}
        {/* <form onSubmit={handleSubmit} className="auth-form">
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
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form> */}

        <form onSubmit={handleSubmit} className="d-grid gap-3">

          {/* Email or Phone */}
          <div>
            <label htmlFor="email" className="form-label">Email</label>
            <div className="position-relative">
              <Mail className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
              <input
                id="email"
                type="email"
                className="form-control ps-5"
                placeholder="Enter your email"
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
                placeholder="Enter your password"
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

          {/* Remember Me + Forgot Password */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="rememberMe" />
              <label className="form-check-label small" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="small text-primary text-decoration-none">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg w-100"
            disabled={loading || googleLoading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>


        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

