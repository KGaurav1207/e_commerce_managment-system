import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const catIcons = {
    'Electronics': 'fas fa-mobile-alt',
    'Fashion': 'fas fa-tshirt',
    'Home & Kitchen': 'fas fa-home',
    'Books': 'fas fa-book',
    'Sports': 'fas fa-running',
    'Beauty': 'fas fa-spa',
    'Toys': 'fas fa-gamepad',
    'Grocery': 'fas fa-shopping-basket',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proRes, catRes] = await Promise.all([
          api.get('/products?limit=8'),
          api.get('/categories')
        ]);
        setProducts(proRes.data.products || []);
        setCategories(catRes.data.categories || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">🔥 Mega Sale - Up to 70% OFF</div>
          <h1>Welcome to <span>ShopMart</span></h1>
          <p>Discover millions of products at unbeatable prices. Shop electronics, fashion, home essentials and much more.</p>
          <div className="hero-btns">
            <Link to="/products" className="btn btn-primary btn-lg">
              <i className="fas fa-shopping-bag"></i> Shop Now
            </Link>
            <Link to="/products?sort=newest" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'white' }}>
              <i className="fas fa-fire"></i> New Arrivals
            </Link>
          </div>
          <div className="hero-stats">
            <div><strong>50K+</strong><span>Products</span></div>
            <div><strong>10K+</strong><span>Brands</span></div>
            <div><strong>1M+</strong><span>Happy Customers</span></div>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://placehold.co/500x400/ff6b00/white?text=ShopMart" alt="ShopMart" />
        </div>
      </section>

      {/* Features Strip */}
      <section className="features-strip">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <i className="fas fa-shipping-fast"></i>
              <div><strong>Free Delivery</strong><span>On orders above ₹499</span></div>
            </div>
            <div className="feature-item">
              <i className="fas fa-undo-alt"></i>
              <div><strong>Easy Returns</strong><span>10-day return policy</span></div>
            </div>
            <div className="feature-item">
              <i className="fas fa-shield-alt"></i>
              <div><strong>Secure Payments</strong><span>100% safe checkout</span></div>
            </div>
            <div className="feature-item">
              <i className="fas fa-headset"></i>
              <div><strong>24/7 Support</strong><span>Always here for you</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-container">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by <span>Category</span></h2>
            <Link to="/products" className="view-all">View All <i className="fas fa-arrow-right"></i></Link>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link to={`/products?category=${cat.category_id}`} key={cat.category_id} className="category-card">
                <div className="cat-icon">
                  <i className={catIcons[cat.name] || 'fas fa-tag'}></i>
                </div>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-container">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured <span>Products</span></h2>
            <Link to="/products" className="view-all">View All <i className="fas fa-arrow-right"></i></Link>
          </div>
          {loading ? (
            <div className="spinner-wrapper"><div className="spinner"></div></div>
          ) : (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p.product_id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="promo-section">
        <div className="container">
          <div className="promo-grid">
            <div className="promo-card promo-primary">
              <div>
                <span className="promo-label">Limited Offer</span>
                <h3>Electronics Sale</h3>
                <p>Up to 40% off on top brands</p>
                <Link to="/products?category=1" className="btn btn-primary btn-sm">Shop Now</Link>
              </div>
              <i className="fas fa-laptop promo-icon"></i>
            </div>
            <div className="promo-card promo-dark">
              <div>
                <span className="promo-label">Trending</span>
                <h3>Fashion Week</h3>
                <p>New arrivals every week</p>
                <Link to="/products?category=2" className="btn btn-outline btn-sm" style={{ color:'white', borderColor:'white' }}>Explore</Link>
              </div>
              <i className="fas fa-tshirt promo-icon"></i>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
