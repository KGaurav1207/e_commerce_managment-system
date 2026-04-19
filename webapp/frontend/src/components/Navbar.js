// ============================================================
// Navbar Component
// ============================================================
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import './Navbar.css';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories || [])).catch(() => {});
    
    // Load search history from localStorage
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error parsing search history:', e);
      }
    }
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    if (search.trim().length >= 2) {
      setSearchLoading(true);
      const timer = setTimeout(async () => {
        try {
          const res = await api.get('/products', { 
            params: { 
              search: search.trim(),
              limit: 5 
            } 
          });
          setSearchSuggestions(res.data.products || []);
        } catch (error) {
          setSearchSuggestions([]);
        } finally {
          setSearchLoading(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSearchSuggestions([]);
      setSearchLoading(false);
    }
  }, [search]);

  // Add to search history
  const addToSearchHistory = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    const newHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const closeMenus = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
    setAdminDropdownOpen(false);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen((open) => !open);
  };

  const toggleAdminDropdown = (e) => {
    e.stopPropagation();
    setAdminDropdownOpen((open) => !open);
  };

  const handleSearch = (e, searchTerm = null) => {
    e?.preventDefault();
    const finalSearch = searchTerm || search;
    const category = e?.target?.querySelector('.search-category')?.value || '';
    
    if (finalSearch.trim()) {
      addToSearchHistory(finalSearch.trim());
    }
    
    const searchParams = new URLSearchParams();
    if (finalSearch.trim()) searchParams.set('search', finalSearch.trim());
    if (category) searchParams.set('category', category);
    
    const query = searchParams.toString();
    navigate(`/products${query ? '?' + query : ''}`);
    setSearch('');
    setShowSuggestions(false);
    closeMenus();
  };

  const handleSearchInputChange = (e) => {
    setSearch(e.target.value);
    setShowSuggestions(true);
  };

  const handleSearchFocus = () => {
    setSearchFocused(true);
    setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    setSearchFocused(false);
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const selectSuggestion = (product) => {
    setSearch(product.name);
    setShowSuggestions(false);
    navigate(`/products/${product.product_id}`);
  };

  const selectHistoryItem = (historyItem) => {
    setSearch(historyItem);
    setShowSuggestions(false);
    handleSearch(null, historyItem);
  };

  const clearSearch = () => {
    setSearch('');
    setShowSuggestions(false);
    setSearchSuggestions([]);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
    navigate('/');
  };

  return (
    <header className="navbar">
      {/* Top Bar */}
      <div className="navbar-top">
        <div className="container">
          <div className="navbar-brand">
            <Link to="/" className="logo" onClick={closeMenus}>
              <i className="fas fa-shopping-bag"></i>
              <span>Shop<strong>Mart</strong></span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <form className="search-bar" onSubmit={handleSearch}>
              <select className="search-category">
                <option value="">All</option>
                {categories.map(category => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search products, brands and more..."
                  value={search}
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                />
                {search && (
                  <button type="button" className="clear-search-btn" onClick={clearSearch}>
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <button type="submit" className="search-btn" disabled={searchLoading}>
                {searchLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-search"></i>
                )}
              </button>
            </form>
            
            {/* Search Suggestions Dropdown */}
            {showSuggestions && (searchFocused || search) && (
              <div className="search-suggestions">
                {searchLoading && (
                  <div className="suggestion-item loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Searching...</span>
                  </div>
                )}
                
                {/* Search Suggestions */}
                {!searchLoading && searchSuggestions.length > 0 && (
                  <div className="suggestion-section">
                    <div className="suggestion-header">Products</div>
                    {searchSuggestions.map(product => (
                      <div
                        key={product.product_id}
                        className="suggestion-item"
                        onClick={() => selectSuggestion(product)}
                      >
                        <img src={product.image_url} alt={product.name} className="suggestion-image" />
                        <div className="suggestion-content">
                          <div className="suggestion-name">{product.name}</div>
                          <div className="suggestion-price">Rs. {product.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Search History */}
                {!searchLoading && search.length === 0 && searchHistory.length > 0 && (
                  <div className="suggestion-section">
                    <div className="suggestion-header">Recent Searches</div>
                    {searchHistory.map((item, index) => (
                      <div
                        key={index}
                        className="suggestion-item history-item"
                        onClick={() => selectHistoryItem(item)}
                      >
                        <i className="fas fa-history"></i>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* No Results */}
                {!searchLoading && search.length >= 2 && searchSuggestions.length === 0 && (
                  <div className="suggestion-item no-results">
                    <i className="fas fa-search"></i>
                    <span>No products found</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nav Actions */}
          <div className="nav-actions">
            {user ? (
              <div className="user-dropdown">
                <div className="user-trigger" onClick={toggleDropdown}>
                  <i className="fas fa-user-circle"></i>
                  <span>{user.name?.split(' ')[0] || 'Account'}</span>
                  <i className="fas fa-chevron-down"></i>
                </div>
                {dropdownOpen && (
                  <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                    <Link to="/profile" onClick={closeMenus}>
                      <i className="fas fa-user"></i> My Profile
                    </Link>
                    <Link to="/orders" onClick={closeMenus}>
                      <i className="fas fa-box"></i> My Orders
                    </Link>
                    <Link to="/wishlist" onClick={closeMenus}>
                      <i className="fas fa-heart"></i> Wishlist
                    </Link>
                                        <hr />
                    <button onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : isAdmin ? (
              /* Admin is logged in, don't show login button */
              null
            ) : (
              <Link to="/login" className="nav-login-btn" onClick={closeMenus}>
                <i className="fas fa-user"></i>
                <span>Login / Register</span>
              </Link>
            )}

            {/* Admin Dropdown Button */}
            {isAdmin && (
              <div className="admin-dropdown">
                <div className="admin-trigger" onClick={toggleAdminDropdown}>
                  <i className="fas fa-user-shield"></i>
                  <span>Admin</span>
                  <i className="fas fa-chevron-down"></i>
                </div>
                {adminDropdownOpen && (
                  <div className="dropdown-menu admin-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                    <Link to="/admin" onClick={closeMenus}>
                      <i className="fas fa-tachometer-alt"></i> Admin Dashboard
                    </Link>
                    <Link to="/admin/products" onClick={closeMenus}>
                      <i className="fas fa-box"></i> Products
                    </Link>
                    <Link to="/admin/orders" onClick={closeMenus}>
                      <i className="fas fa-shopping-bag"></i> Orders
                    </Link>
                    <Link to="/admin/users" onClick={closeMenus}>
                      <i className="fas fa-users"></i> Users
                    </Link>
                    <Link to="/admin/inventory" onClick={closeMenus}>
                      <i className="fas fa-warehouse"></i> Inventory
                    </Link>
                    <hr />
                    <button onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            <Link to="/wishlist" className="nav-icon-btn" onClick={closeMenus}>
              <i className="fas fa-heart"></i>
              <span className="nav-label">Wishlist</span>
            </Link>

            <Link to="/cart" className="nav-icon-btn cart-btn" onClick={closeMenus}>
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
            <li><Link to="/" onClick={closeMenus}><i className="fas fa-home"></i> Home</Link></li>
            <li><Link to="/products" onClick={closeMenus}>All Products</Link></li>
            {categories.map(category => (
              <li key={category.category_id}>
                <Link to={`/products?category=${category.category_id}`} onClick={closeMenus}>
                  {category.name}
                </Link>
              </li>
            ))}
            <li><Link to="/products?sort=price_desc" className="offer-link" onClick={closeMenus}><i className="fas fa-fire"></i> Hot Deals</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
