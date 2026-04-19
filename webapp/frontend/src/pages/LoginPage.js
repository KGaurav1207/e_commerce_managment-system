import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loginMode, setLoginMode] = useState('user');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (loginMode === 'admin') {
        const data = await adminLogin(form.email, form.password);
        toast.success(`Welcome back, ${data.admin?.name || 'Admin'}! Dashboard is ready.`);
        navigate('/admin');
      } else {
        const data = await login(form.email, form.password);
        toast.success(`Welcome back, ${data.user?.name?.split(' ')[0] || 'there'}! Great to see you.`);
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <i className="fas fa-shopping-bag"></i>
            <h1>Shop<strong>Mart</strong></h1>
          </div>
          <h2>Welcome Back!</h2>
          <p>Login to access your account, track orders and discover amazing deals.</p>
          <div className="auth-features">
            <div><i className="fas fa-check-circle"></i><span>Exclusive member deals</span></div>
            <div><i className="fas fa-check-circle"></i><span>Track your orders</span></div>
            <div><i className="fas fa-check-circle"></i><span>Save your wishlist</span></div>
            <div><i className="fas fa-check-circle"></i><span>Fast checkout</span></div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-card">
            <h2>Login to Your Account</h2>
            <p className="auth-subtitle">Enter your credentials to continue</p>

            <div className="form-footer-row" style={{ marginBottom: '16px' }}>
              <button
                type="button"
                className={`btn btn-sm ${loginMode === 'user' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setLoginMode('user')}
              >
                User Login
              </button>
              <button
                type="button"
                className={`btn btn-sm ${loginMode === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setLoginMode('admin')}
              >
                Admin Login
              </button>
            </div>

            {loginMode === 'admin' && (
              <p style={{ marginBottom: '16px', color: 'var(--text-light)' }}>
                Admin users should use <strong>admin@shopmart.com</strong> / <strong>Admin@123</strong>.
              </p>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-icon-wrap">
                  <i className="fas fa-envelope"></i>
                  <input type="email" name="email" placeholder="you@example.com"
                    value={form.email} onChange={handleChange}
                    className="form-control" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-icon-wrap">
                  <i className="fas fa-lock"></i>
                  <input type={showPwd ? 'text' : 'password'} name="password"
                    placeholder="Enter your password"
                    value={form.password} onChange={handleChange}
                    className="form-control" required />
                  <button type="button" className="toggle-pwd" onClick={() => setShowPwd(!showPwd)}>
                    <i className={`fas fa-eye${showPwd ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>

              <div className="form-footer-row">
                <label className="remember-me">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" className="forgot-link">Forgot Password?</a>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Logging in...</> : 'Login'}
              </button>
            </form>

            
            <p className="auth-switch">
              New to ShopMart? <Link to="/register">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
