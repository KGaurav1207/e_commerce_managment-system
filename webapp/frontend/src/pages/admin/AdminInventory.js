import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import AdminLayout from './AdminLayout';

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [editMin, setEditMin] = useState('');

  const fetchInventory = () => {
    api.get('/admin/inventory').then(r => setInventory(r.data.inventory || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchInventory(); }, []);

  const startEdit = (item) => {
    setEditId(item.product_id);
    setEditStock(item.stock_quantity);
    setEditMin(item.min_stock_alert);
  };

  const saveEdit = async (productId) => {
    try {
      await api.put(`/admin/inventory/${productId}`, { stock_quantity: editStock, min_stock_alert: editMin });
      toast.success('Inventory updated!');
      setEditId(null);
      fetchInventory();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update inventory'); }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h2>🏭 Inventory Management</h2>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon green"><i className="fas fa-check-circle"></i></div>
          <div className="stat-info">
            <label>In Stock</label>
            <strong>{inventory.filter(i => i.stock_quantity > i.min_stock_alert).length}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><i className="fas fa-exclamation-triangle"></i></div>
          <div className="stat-info">
            <label>Low Stock</label>
            <strong>{inventory.filter(i => i.stock_quantity <= i.min_stock_alert && i.stock_quantity > 0).length}</strong>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><i className="fas fa-times-circle"></i></div>
          <div className="stat-info">
            <label>Out of Stock</label>
            <strong>{inventory.filter(i => i.stock_quantity === 0).length}</strong>
          </div>
        </div>
      </div>

      <div className="admin-table-section">
        <div className="admin-table-header">
          <h3>Product Inventory ({inventory.length})</h3>
        </div>
        <div className="table-wrapper">
          {loading ? <div className="spinner-wrapper"><div className="spinner"></div></div> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Min Alert</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.inventory_id}>
                    <td><strong>{item.product_name}</strong></td>
                    <td>{item.category_name || '—'}</td>
                    <td>₹{parseFloat(item.price).toLocaleString('en-IN')}</td>
                    <td>
                      {editId === item.product_id ? (
                        <input type="number" className="form-control" style={{ width: 80 }}
                          value={editStock} onChange={e => setEditStock(e.target.value)} />
                      ) : <strong>{item.stock_quantity}</strong>}
                    </td>
                    <td>
                      {editId === item.product_id ? (
                        <input type="number" className="form-control" style={{ width: 80 }}
                          value={editMin} onChange={e => setEditMin(e.target.value)} />
                      ) : item.min_stock_alert}
                    </td>
                    <td>
                      {item.stock_quantity === 0 ? (
                        <span className="badge badge-danger">Out of Stock</span>
                      ) : item.stock_quantity <= item.min_stock_alert ? (
                        <span className="badge badge-warning">Low Stock</span>
                      ) : (
                        <span className="badge badge-success">In Stock</span>
                      )}
                    </td>
                    <td>
                      {editId === item.product_id ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-success btn-sm" onClick={() => saveEdit(item.product_id)}>
                            <i className="fas fa-check"></i>
                          </button>
                          <button className="btn btn-outline btn-sm" onClick={() => setEditId(null)}>
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => startEdit(item)}>
                          <i className="fas fa-edit"></i> Edit
                        </button>
                      )}
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

export default AdminInventory;
