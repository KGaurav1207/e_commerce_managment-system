import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { resolveImageUrl, handleImageError } from '../../utils/image';
import AdminLayout from './AdminLayout';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', discount_price: '', category_id: '', brand: '', image_url: '', stock_quantity: '' });

  const fetchProducts = () => {
    api.get('/products?limit=50').then(r => setProducts(r.data.products || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    api.get('/categories').then(r => setCategories(r.data.categories || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', form);
      toast.success(`"${form.name}" added to the product catalog!`);
      setShowForm(false);
      setForm({ name: '', description: '', price: '', discount_price: '', category_id: '', brand: '', image_url: '', stock_quantity: '' });
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Error creating product'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product removed from the catalog');
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Error deleting product'); }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h2>📦 Products Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className="fas fa-plus"></i> Add Product
        </button>
      </div>

      {showForm && (
        <div className="card card-body" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 20 }}>Add New Product</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input type="text" className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Brand</label>
                <input type="text" className="form-control" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input type="number" className="form-control" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Discount Price (₹)</label>
                <input type="number" className="form-control" value={form.discount_price} onChange={e => setForm({ ...form, discount_price: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input type="number" className="form-control" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input type="text" className="form-control" placeholder="https://..." value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> Save Product</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-section">
        <div className="admin-table-header">
          <h3>All Products ({products.length})</h3>
        </div>
        <div className="table-wrapper">
          {loading ? <div className="spinner-wrapper"><div className="spinner"></div></div> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.product_id}>
                    <td>#{p.product_id}</td>
                    <td>
                      <img
                        src={resolveImageUrl({ imageUrl: p.image_url, name: p.name, size: '50x50' })}
                        alt=""
                        style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }}
                        onError={(e) => handleImageError(e, { name: p.name, size: '50x50' })}
                      />
                    </td>
                    <td><strong>{p.name}</strong><br /><small style={{ color: 'var(--text-light)' }}>{p.brand}</small></td>
                    <td>{p.category_name || '—'}</td>
                    <td>
                      ₹{parseFloat(p.discount_price || p.price).toLocaleString('en-IN')}
                      {p.discount_price && <br />}
                      {p.discount_price && <small style={{ textDecoration: 'line-through', color: 'var(--gray)' }}>₹{parseFloat(p.price).toLocaleString('en-IN')}</small>}
                    </td>
                    <td>
                      <span className={`badge badge-${p.stock_quantity > 10 ? 'success' : p.stock_quantity > 0 ? 'warning' : 'danger'}`}>
                        {p.stock_quantity || 0}
                      </span>
                    </td>
                    <td>⭐ {parseFloat(p.rating || 0).toFixed(1)}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.product_id)}>
                        <i className="fas fa-trash"></i>
                      </button>
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

export default AdminProducts;
