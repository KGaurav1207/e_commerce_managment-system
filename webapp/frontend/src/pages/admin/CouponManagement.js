import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import AdminLayout from './AdminLayout';
import './AdminPages.css';

const EMPTY_FORM = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '',
  minimum_amount: '',
  usage_limit: '',
  end_date: '',
  is_active: true
};

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons/admin/all');
      if (res.data.success) setCoupons(res.data.coupons);
    } catch {
      toast.error('Error fetching coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        minimum_amount: formData.minimum_amount ? parseFloat(formData.minimum_amount) : 0,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        end_date: formData.end_date || null,
      };
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon.coupon_id}`, payload);
        toast.success(`Coupon "${formData.code}" updated successfully!`);
      } else {
        await api.post('/coupons', payload);
        toast.success(`Coupon "${formData.code}" created and is now live!`);
      }
      resetForm();
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingCoupon(null);
    setShowForm(false);
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      minimum_amount: coupon.minimum_amount || '',
      usage_limit: coupon.usage_limit || '',
      end_date: coupon.end_date ? coupon.end_date.split('T')[0] : '',
      is_active: Boolean(coupon.is_active)
    });
    setEditingCoupon(coupon);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted and removed from the store');
      fetchCoupons();
    } catch {
      toast.error('Error deleting coupon');
    }
  };

  const handleToggle = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon.coupon_id}`, { is_active: !coupon.is_active });
      toast.success(`Coupon "${coupon.code}" ${coupon.is_active ? 'deactivated — customers can no longer redeem it' : 'activated — customers can now redeem it'}`);
      fetchCoupons();
    } catch {
      toast.error('Error updating coupon');
    }
  };

  const activeCoupons = coupons.filter(c => c.is_active).length;
  const totalUsage = coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0);

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h2><i className="fas fa-ticket-alt"></i> Coupon Management</h2>
        {!showForm && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus"></i> Add Coupon
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon blue"><i className="fas fa-ticket-alt"></i></div>
          <div className="stat-info"><label>Total Coupons</label><strong>{coupons.length}</strong></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><i className="fas fa-check-circle"></i></div>
          <div className="stat-info"><label>Active</label><strong>{activeCoupons}</strong></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><i className="fas fa-fire"></i></div>
          <div className="stat-info"><label>Total Redemptions</label><strong>{totalUsage}</strong></div>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="admin-table-section" style={{ marginBottom: 24 }}>
          <div className="admin-table-header">
            <h3>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h3>
            <button className="btn btn-sm btn-outline" onClick={resetForm}>
              <i className="fas fa-times"></i> Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Coupon Code *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., SAVE10"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Save 10% on your order"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="coupon-form-grid">
              <div className="form-group">
                <label className="form-label">Discount Type *</label>
                <select
                  className="form-control"
                  value={formData.discount_type}
                  onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {formData.discount_type === 'percentage' ? 'Discount %' : 'Discount ₹'} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={formData.discount_type === 'percentage' ? '100' : undefined}
                  className="form-control"
                  placeholder={formData.discount_type === 'percentage' ? '10' : '200'}
                  value={formData.discount_value}
                  onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Order (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  placeholder="0 (no minimum)"
                  value={formData.minimum_amount}
                  onChange={e => setFormData({ ...formData, minimum_amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Usage Limit</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  placeholder="Unlimited"
                  value={formData.usage_limit}
                  onChange={e => setFormData({ ...formData, usage_limit: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.end_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
              <div className="form-group coupon-active-toggle">
                <label className="form-label">Status</label>
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span className="toggle-text">
                    {formData.is_active ? 'Active — users can redeem' : 'Inactive — hidden from users'}
                  </span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting
                  ? <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                  : editingCoupon ? 'Update Coupon' : 'Create Coupon'
                }
              </button>
              <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      <div className="admin-table-section">
        <div className="admin-table-header">
          <h3>All Coupons ({coupons.length})</h3>
        </div>

        {loading ? (
          <div className="spinner-wrapper"><div className="spinner"></div></div>
        ) : coupons.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><i className="fas fa-ticket-alt"></i></div>
            <h3>No coupons yet</h3>
            <p>Create your first coupon to offer discounts to customers.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <i className="fas fa-plus"></i> Add Coupon
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Usage</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(coupon => {
                  const isExpired = coupon.end_date && new Date(coupon.end_date) < new Date();
                  return (
                    <tr key={coupon.coupon_id}>
                      <td>
                        <strong className="coupon-code-cell">{coupon.code}</strong>
                      </td>
                      <td className="coupon-desc-cell">{coupon.description || '—'}</td>
                      <td>
                        <span className={`badge ${coupon.discount_type === 'percentage' ? 'badge-success' : 'badge-info'}`}>
                          {coupon.discount_type === 'percentage'
                            ? `${coupon.discount_value}% OFF`
                            : `₹${coupon.discount_value} OFF`
                          }
                        </span>
                      </td>
                      <td>
                        {coupon.minimum_amount > 0
                          ? `₹${parseFloat(coupon.minimum_amount).toLocaleString('en-IN')}`
                          : <span style={{ color: 'var(--text-light)' }}>None</span>
                        }
                      </td>
                      <td>
                        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {coupon.usage_count}
                          <span style={{ color: 'var(--text-light)' }}>
                            /{coupon.usage_limit ?? '∞'}
                          </span>
                        </span>
                      </td>
                      <td style={{ color: isExpired ? 'var(--danger)' : 'inherit' }}>
                        {coupon.end_date
                          ? new Date(coupon.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : <span style={{ color: 'var(--text-light)' }}>No expiry</span>
                        }
                        {isExpired && <span className="badge badge-danger" style={{ marginLeft: 6 }}>Expired</span>}
                      </td>
                      <td>
                        <span className={`badge ${coupon.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {coupon.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleEdit(coupon)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className={`btn btn-sm ${coupon.is_active ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => handleToggle(coupon)}
                            title={coupon.is_active ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`fas fa-${coupon.is_active ? 'ban' : 'check'}`}></i>
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(coupon.coupon_id)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CouponManagement;
