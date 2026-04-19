import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminPages.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/admin', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { to: '/admin/products', icon: 'fas fa-box', label: 'Products' },
    { to: '/admin/orders', icon: 'fas fa-shopping-bag', label: 'Orders' },
    { to: '/admin/users', icon: 'fas fa-users', label: 'Customers' },
    { to: '/admin/inventory', icon: 'fas fa-warehouse', label: 'Inventory' },
    { to: '/admin/coupons', icon: 'fas fa-ticket-alt', label: 'Coupons' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <i className="fas fa-shopping-bag" style={{ color: 'var(--primary)' }}></i>
            <strong>ShopMart</strong> Admin
          </Link>
          <h3>Navigation</h3>
        </div>
        {navLinks.map(l => (
          <Link key={l.to} to={l.to}
            className={`admin-nav-link ${location.pathname === l.to ? 'active' : ''}`}>
            <i className={l.icon}></i> {l.label}
          </Link>
        ))}
        <div style={{ marginTop: 'auto', padding: '20px 0 0' }}>
          <button className="admin-nav-link" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
