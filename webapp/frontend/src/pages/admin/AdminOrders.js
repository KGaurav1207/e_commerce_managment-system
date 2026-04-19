import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import AdminLayout from './AdminLayout';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

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
                  <th>Order ID</th><th>Customer</th><th>Email</th><th>Amount</th><th>Date</th><th>Status</th><th>Update Status</th>
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
    </AdminLayout>
  );
};

export default AdminOrders;
