import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import AdminLayout from './AdminLayout';
import Receipt from '../../components/Receipt';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    api.get('/admin/orders').then(r => setOrders(r.data.orders || [])).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      toast.success(`Order #${orderId} status updated to ${status}`);
      setOrders(orders.map(o => o.order_id === orderId ? { ...o, status } : o));
    } catch { toast.error('Failed to update status'); }
  };

  const handleViewReceipt = async (orderId) => {
    try {
      console.log('Generating admin receipt for order:', orderId);
      const res = await api.get(`/payments/admin/receipt/${orderId}`);
      if (res.data.success) {
        setReceiptData(res.data.receipt);
        setShowReceipt(true);
        toast.success('Receipt generated successfully!');
      } else {
        toast.error(res.data.message || 'Failed to generate receipt');
      }
    } catch (err) {
      console.error('Admin receipt error:', err);
      if (err.response?.status === 403) {
        toast.error('Admin access required to view receipts');
      } else if (err.response?.status === 404) {
        toast.error('Order not found');
      } else {
        toast.error(err.response?.data?.message || 'Failed to generate receipt');
      }
    }
  };

  const filtered = filter ? orders.filter(o => o.status === filter) : orders;

  const statusColors = { pending: 'warning', confirmed: 'info', processing: 'info', shipped: 'primary', delivered: 'success', cancelled: 'danger' };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h2>🛍️ Orders Management</h2>
        <select className="form-control" style={{ width: 180 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="admin-table-section">
        <div className="admin-table-header">
          <h3>All Orders ({filtered.length})</h3>
        </div>
        <div className="table-wrapper">
          {loading ? <div className="spinner-wrapper"><div className="spinner"></div></div> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Email</th><th>Amount</th><th>Date</th><th>Status</th><th>Receipt</th><th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.order_id}>
                    <td><strong>#{o.order_id}</strong></td>
                    <td>{o.customer_name}</td>
                    <td>{o.customer_email}</td>
                    <td><strong>₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</strong></td>
                    <td>{new Date(o.order_date).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${statusColors[o.status] || 'warning'}`}>{o.status}</span></td>
                    <td>
                      <button 
                        className="btn btn-outline btn-sm" 
                        onClick={() => handleViewReceipt(o.order_id)}
                        title="View Receipt"
                      >
                        <i className="fas fa-receipt"></i> Receipt
                      </button>
                    </td>
                    <td>
                      <select className="status-select" value={o.status}
                        onChange={e => updateStatus(o.order_id, e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
              userType="admin"
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
