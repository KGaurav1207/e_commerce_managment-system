import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col brand-col">
              <Link to="/" className="footer-logo">
                <i className="fas fa-shopping-bag"></i>
                <span>Shop<strong>Mart</strong></span>
              </Link>
              <p>Your ultimate shopping destination. Find the best deals on electronics, fashion, home & more.</p>
              <div className="social-links">
                <a href="https://facebook.com/shopmart" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></a>
                <a href="https://twitter.com/shopmart" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
                <a href="https://instagram.com/shopmart" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
                <a href="https://youtube.com/shopmart" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/products">Products</Link></li>
                <li><Link to="/cart">My Cart</Link></li>
                <li><Link to="/orders">My Orders</Link></li>
                <li><Link to="/profile">My Profile</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Categories</h4>
              <ul>
                <li><Link to="/products?category=1">Electronics</Link></li>
                <li><Link to="/products?category=7">Fashion</Link></li>
                <li><Link to="/products?category=8">Home & Kitchen</Link></li>
                <li><Link to="/products?category=3">Books</Link></li>
                <li><Link to="/products?category=5">Sports</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Help & Support</h4>
              <ul>
                <li><Link to="/faq">FAQ</Link></li>
                <li><Link to="/shipping-policy">Shipping Policy</Link></li>
                <li><Link to="/returns">Returns & Refunds</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Contact Us</h4>
              <ul>
                <li><i className="fas fa-map-marker-alt"></i> 123 ShopMart St, Mumbai, India</li>
                <li><i className="fas fa-phone"></i> +91 98765 43210</li>
                <li><i className="fas fa-envelope"></i> support@shopmart.com</li>
                <li><i className="fas fa-clock"></i> Mon-Sat: 9 AM - 6 PM</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-middle">
        <div className="container">
          <p><i className="fas fa-shield-alt"></i> Secure Payments</p>
          <div className="payment-icons">
            <span><i className="fab fa-cc-visa"></i></span>
            <span><i className="fab fa-cc-mastercard"></i></span>
            <span><i className="fab fa-cc-paypal"></i></span>
            <span><i className="fab fa-google-pay"></i></span>
            <span><i className="fas fa-mobile-alt"></i> UPI</span>
            <span><i className="fas fa-money-bill-wave"></i> COD</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© 2024 ShopMart E-Commerce. All rights reserved.</p>
          <p>Made with <i className="fas fa-heart" style={{ color: 'var(--primary)' }}></i> in India</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
