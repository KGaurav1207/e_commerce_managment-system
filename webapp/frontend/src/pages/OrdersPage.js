import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './OrdersPage.css';

const statusConfig = {
  pending: { color: '#ffc107', icon: 'fas fa-clock', label: 'Pending' },
  confirmed: { color: '#17a2b8', icon: 'fas fa-check', label: 'Confirmed' },
  processing: { color: '#007bff', icon: 'fas fa-cog', label: 'Processing' },
  shipped: { color: '#6610f2', icon: 'fas fa-truck', label: 'Shipped' },
  delivered: { color: '#28a745', icon: 'fas fa-check-circle', label: 'Delivered' },
  cancelled: { color: '#dc3545', icon: 'fas fa-times-circle', label: 'Cancelled' },
  returned: { color: '#fd7e14', icon: 'fas fa-undo', label: 'Returned' },
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data.orders || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;

  return (
    <div className="orders-page page-container">
      <div className="container">
        <h1 className="section-title">My Orders</h1>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><i className="fas fa-box-open"></i></div>
            <h3>No orders yet</h3>
            <p>Your order history will appear here once you make a purchase</p>
            <Link to="/products" className="btn btn-primary btn-lg">Shop Now</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const st = statusConfig[order.status] || statusConfig.pending;
              return (
                <div className="order-card card card-body" key={order.order_id}>
                  <div className="order-header">
                    <div className="order-id">
                      <span>Order</span>
                      <strong>#{order.order_id}</strong>
                    </div>
                    <div className="order-status" style={{ color: st.color, background: st.color + '15', border: `1px solid ${st.color}40` }}>
                      <i className={st.icon}></i> {st.label}
                    </div>
                  </div>
                  <div className="order-body">
                    <div className="order-meta">
                      <div>
                        <label>Order Date</label>
                        <strong>{new Date(order.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                      </div>
                      <div>
                        <label>Total Amount</label>
                        <strong>₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</strong>
                      </div>
                      <div>
                        <label>Payment</label>
                        <strong>{order.payment_method?.replace('_', ' ').toUpperCase() || 'N/A'}</strong>
                      </div>
                      {order.city && (
                        <div>
                          <label>Deliver To</label>
                          <strong>{order.city}, {order.state}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="order-footer">
                    <Link to={`/orders/${order.order_id}`} className="btn btn-outline btn-sm">
                      <i className="fas fa-eye"></i> View Details
                    </Link>
                    {order.status === 'shipped' && (
                      <Link to={`/orders/${order.order_id}`} className="btn btn-primary btn-sm">
                        <i className="fas fa-map-marker-alt"></i> Track Order
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
