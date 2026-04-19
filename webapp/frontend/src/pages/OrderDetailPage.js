import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { resolveImageUrl, handleImageError } from '../utils/image';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => {
      setOrder(r.data.order);
      setItems(r.data.items || []);
      setTracking(r.data.tracking || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;
  if (!order) return <div className="container"><div className="alert alert-danger">Order not found</div></div>;

  const statusSteps = ['Order Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIdx = statusSteps.findIndex(s => s.toLowerCase().includes(order.status)) + 1 || 1;

  return (
    <div className="order-detail-page page-container">
      <div className="container">
        <div className="detail-head">
          <div>
            <nav className="breadcrumb">
              <Link to="/orders">My Orders</Link> <i className="fas fa-chevron-right"></i>
              <span>Order #{order.order_id}</span>
            </nav>
            <h1>Order #{order.order_id}</h1>
            <p className="order-date">Placed on {new Date(order.order_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <span className={`order-status-badge badge-${order.status}`}>
            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
          </span>
        </div>

        <div className="order-detail-grid">
          <div className="order-detail-main">
            {/* Tracking Timeline */}
            <div className="card card-body tracking-section">
              <h3><i className="fas fa-map-marker-alt"></i> Order Tracking</h3>
              <div className="tracking-steps">
                {statusSteps.map((step, i) => (
                  <div key={step} className={`track-step ${i < currentStepIdx ? 'done' : ''} ${i === currentStepIdx - 1 ? 'active' : ''}`}>
                    <div className="track-dot">
                      {i < currentStepIdx ? <i className="fas fa-check"></i> : i + 1}
                    </div>
                    <div className="track-info">
                      <strong>{step}</strong>
                      {tracking.find(t => t.status.toLowerCase().includes(step.toLowerCase().split(' ')[0])) && (
                        <span>{new Date(tracking.find(t => t.status.toLowerCase().includes(step.toLowerCase().split(' ')[0])).updated_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    {i < statusSteps.length - 1 && <div key={`line-${i}`} className={`track-line ${i < currentStepIdx - 1 ? 'done' : ''}`}></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="card card-body">
              <h3><i className="fas fa-box"></i> Order Items</h3>
              {items.map(item => (
                <div className="order-item-row" key={item.order_detail_id}>
                  <img
                    src={resolveImageUrl({ imageUrl: item.image_url, name: item.name, size: '70x70' })}
                    alt={item.name}
                    onError={(e) => handleImageError(e, { name: item.name, size: '70x70' })}
                  />
                  <div key={`info-${item.order_detail_id}`} className="order-item-info">
                    <strong>{item.name}</strong>
                    <span>{item.brand}</span>
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <div key={`price-${item.order_detail_id}`} className="order-item-price">
                    <strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                    <span>₹{parseFloat(item.price).toLocaleString('en-IN')} × {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-detail-sidebar">
            {/* Delivery Info */}
            {order.full_name && (
              <div className="card card-body">
                <h4><i className="fas fa-map-marker-alt"></i> Delivery Address</h4>
                <p>{order.full_name}</p>
                <p>{order.street}</p>
                <p>{order.city}, {order.state} - {order.zip_code}</p>
                <p>{order.country}</p>
              </div>
            )}

            {/* Payment Info */}
            <div className="card card-body">
              <h4><i className="fas fa-credit-card"></i> Payment Details</h4>
              <div className="info-row"><span>Method</span><strong>{order.payment_method?.replace('_', ' ').toUpperCase()}</strong></div>
              <div className="info-row"><span>Status</span>
                <strong style={{ color: order.payment_status === 'success' ? 'var(--success)' : 'var(--warning)' }}>
                  {order.payment_status?.toUpperCase()}
                </strong>
              </div>
              {order.tracking_number && (
                <div className="info-row"><span>Tracking No.</span><strong>{order.tracking_number}</strong></div>
              )}
            </div>

            {/* Price Summary */}
            <div className="card card-body">
              <h4><i className="fas fa-receipt"></i> Price Summary</h4>
              <div className="info-row"><span>Subtotal</span><strong>₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</strong></div>
              <div className="info-row"><span>Shipping</span><strong className="free">FREE</strong></div>
              <hr />
              <div className="info-row total-row"><span>Total</span><strong>₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</strong></div>
            </div>

            {order.status === 'delivered' && (
              <div className="review-section">
                <h4><i className="fas fa-star"></i> Rate & Review Products</h4>
                <p className="review-subtitle">Share your experience with the products you received</p>
                {items.map(item => (
                  <Link key={item.order_detail_id} to={`/products/${item.product_id}`} className="btn btn-outline btn-full review-btn">
                    <i className="fas fa-star"></i> Review {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
