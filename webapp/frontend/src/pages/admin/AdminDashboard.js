import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import AdminLayout from './AdminLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => {
      setStats(r.data.stats);
      setRecentOrders(r.data.recentOrders || []);
      setLowStock(r.data.lowStock || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: 'fas fa-users', cls: 'blue' },
    { label: 'Total Products', value: stats.totalProducts, icon: 'fas fa-box', cls: 'orange' },
    { label: 'Total Orders', value: stats.totalOrders, icon: 'fas fa-shopping-bag', cls: 'purple' },
    { label: 'Revenue', value: `₹${parseFloat(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: 'fas fa-rupee-sign', cls: 'green' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: 'fas fa-clock', cls: 'red' },
  ] : [];

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h2>📊 Dashboard Overview</h2>
        <span style={{ fontSize: 13, color: 'var(--text-light)' }}>Welcome back, Admin</span>
      </div>

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner"></div></div>
      ) : (
        <>
          <div className="stats-grid">
            {statCards.map((s, i) => (
              <div className="stat-card" key={i}>
                <div className={`stat-icon ${s.cls}`}><i className={s.icon}></i></div>
                <div className="stat-info">
                  <label>{s.label}</label>
                  <strong>{s.value}</strong>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Recent Orders */}
            <div className="admin-table-section">
              <div className="admin-table-header">
                <h3>Recent Orders</h3>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(o => (
                      <tr key={o.order_id}>
                        <td>#{o.order_id}</td>
                        <td>{o.customer}</td>
                        <td>₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`badge badge-${o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'danger' : 'warning'}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="admin-table-section">
              <div className="admin-table-header">
                <h3>⚠️ Low Stock Alert</h3>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Stock</th>
                      <th>Min Alert</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td><span className="badge badge-danger">{item.stock_quantity}</span></td>
                        <td>{item.min_stock_alert}</td>
                      </tr>
                    ))}
                    {lowStock.length === 0 && (
                      <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--success)' }}>✅ All products well stocked!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
