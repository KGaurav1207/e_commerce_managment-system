// ============================================================
// Navbar Component
// ============================================================
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      {/* Top Bar */}
      <div className="navbar-top">
        <div className="container">
          <div className="navbar-brand">
            <Link to="/" className="logo">
              <i className="fas fa-shopping-bag"></i>
              <span>Shop<strong>Mart</strong></span>
            </Link>
          </div>

          {/* Search Bar */}
          <form className="search-bar" onSubmit={handleSearch}>
            <select className="search-category">
              <option>All</option>
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Home</option>
            </select>
            <input
              type="text"
              placeholder="Search products, brands and more..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </form>

          {/* Nav Actions */}
          <div className="nav-actions">
            {user ? (
              <div className="user-dropdown" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="user-trigger">
                  <i className="fas fa-user-circle"></i>
                  <span>{user.name?.split(' ')[0] || 'Account'}</span>
                  <i className="fas fa-chevron-down"></i>
                </div>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                      <i className="fas fa-user"></i> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setDropdownOpen(false)}>
                      <i className="fas fa-box"></i> My Orders
                    </Link>
                    <Link to="/wishlist" onClick={() => setDropdownOpen(false)}>
                      <i className="fas fa-heart"></i> Wishlist
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)}>
                        <i className="fas fa-cog"></i> Admin Panel
                      </Link>
                    )}
                    <hr />
                    <button onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav-login-btn">
                <i className="fas fa-user"></i>
                <span>Login / Register</span>
              </Link>
            )}

            <Link to="/wishlist" className="nav-icon-btn">
              <i className="fas fa-heart"></i>
              <span className="nav-label">Wishlist</span>
            </Link>

            <Link to="/cart" className="nav-icon-btn cart-btn">
              <div className="cart-icon-wrap">
                <i className="fas fa-shopping-cart"></i>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </div>
              <span className="nav-label">Cart</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <i className={`fas fa-${menuOpen ? 'times' : 'bars'}`}></i>
          </button>
        </div>
      </div>

      {/* Bottom Nav - Categories */}
      <nav className={`navbar-bottom ${menuOpen ? 'open' : ''}`}>
        <div className="container">
          <ul className="nav-links">
            <li><Link to="/" onClick={() => setMenuOpen(false)}><i className="fas fa-home"></i> Home</Link></li>
            <li><Link to="/products" onClick={() => setMenuOpen(false)}>All Products</Link></li>
            <li><Link to="/products?category=1" onClick={() => setMenuOpen(false)}>Electronics</Link></li>
            <li><Link to="/products?category=2" onClick={() => setMenuOpen(false)}>Fashion</Link></li>
            <li><Link to="/products?category=3" onClick={() => setMenuOpen(false)}>Home & Kitchen</Link></li>
            <li><Link to="/products?category=4" onClick={() => setMenuOpen(false)}>Books</Link></li>
            <li><Link to="/products?category=5" onClick={() => setMenuOpen(false)}>Sports</Link></li>
            <li><Link to="/products?sort=discount" className="offer-link" onClick={() => setMenuOpen(false)}>🔥 Offers</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
