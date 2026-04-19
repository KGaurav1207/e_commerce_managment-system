import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Receipt from '../components/Receipt';
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
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data.orders || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleViewReceipt = async (orderId) => {
    try {
      // Try to get receipt from payments endpoint first
      const receiptRes = await api.get(`/payments/receipt/${orderId}`);
      if (receiptRes.data.success) {
        setReceiptData(receiptRes.data.receipt);
        setShowReceipt(true);
        return;
      }
    } catch (err) {
      // If payment receipt fails, create receipt from order data
      try {
        const orderRes = await api.get(`/orders/${orderId}`);
        if (orderRes.data.success) {
          const order = orderRes.data.order;
          const items = orderRes.data.items || [];
          
          // Create receipt data from order
          const receiptData = {
            order_id: orderId,
            created_at: order.order_date,
            total_amount: order.total_amount,
            payment_method: order.payment_method,
            status: order.status,
            shipping_cost: order.total_amount > 499 ? 0 : 49,
            discount_amount: 0,
            shipping_address: null,
            items: items.map(item => ({
              order_item_id: item.order_item_id,
              product_id: item.product_id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              discount_price: item.discount_price || item.price,
              image_url: item.image_url
            })),
            payment: {
              transaction_id: 'TXN' + Date.now(),
              payment_method: order.payment_method,
              amount: order.total_amount,
              status: 'success',
              payment_date: order.order_date
            }
          };
          
          setReceiptData(receiptData);
          setShowReceipt(true);
        }
      } catch (orderErr) {
        toast.error('Failed to generate receipt');
      }
    }
  };

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
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => handleViewReceipt(order.order_id)}
                      title="View Receipt"
                    >
                      <i className="fas fa-receipt"></i> Receipt
                    </button>
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

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="modal-overlay">
          <div className="modal-content receipt-modal">
            <button className="modal-close" onClick={() => setShowReceipt(false)}>
              <i className="fas fa-times"></i>
            </button>
            <Receipt 
              orderData={receiptData} 
              userType="user"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
