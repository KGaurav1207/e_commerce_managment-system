import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      return toast.error('Passwords do not match');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success('Account created successfully! Welcome to ShopMart 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <h2>Join ShopMart Today!</h2>
          <p>Create your account and unlock exclusive deals, fast shipping and personalized recommendations.</p>
          <div className="auth-features">
            <div><i className="fas fa-gift"></i><span>₹200 welcome coupon</span></div>
            <div><i className="fas fa-truck"></i><span>Free delivery on first order</span></div>
            <div><i className="fas fa-star"></i><span>Earn reward points</span></div>
            <div><i className="fas fa-bell"></i><span>Deal alerts & notifications</span></div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-card">
            <h2>Create New Account</h2>
            <p className="auth-subtitle">Fill in the details below to get started</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-icon-wrap">
                  <i className="fas fa-user"></i>
                  <input type="text" name="name" placeholder="John Doe"
                    value={form.name} onChange={handleChange}
                    className="form-control" required />
                </div>
              </div>

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
                <label className="form-label">Phone Number (Optional)</label>
                <div className="input-icon-wrap">
                  <i className="fas fa-phone"></i>
                  <input type="tel" name="phone" placeholder="+91 98765 43210"
                    value={form.phone} onChange={handleChange}
                    className="form-control" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-icon-wrap">
                    <i className="fas fa-lock"></i>
                    <input type={showPwd ? 'text' : 'password'} name="password"
                      placeholder="Min. 6 characters"
                      value={form.password} onChange={handleChange}
                      className="form-control" required />
                    <button type="button" className="toggle-pwd" onClick={() => setShowPwd(!showPwd)}>
                      <i className={`fas fa-eye${showPwd ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-icon-wrap">
                    <i className="fas fa-lock"></i>
                    <input type="password" name="confirm" placeholder="Repeat password"
                      value={form.confirm} onChange={handleChange}
                      className="form-control" required />
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '12px' }}>
                By creating an account, you agree to our <a href="#" style={{ color: 'var(--primary)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--primary)' }}>Privacy Policy</a>.
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Creating Account...</> : 'Create Account'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
