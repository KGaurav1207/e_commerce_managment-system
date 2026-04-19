import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/users/profile').then(r => setProfile(r.data.user)).catch(() => {});
    api.get('/users/addresses').then(r => setAddresses(r.data.addresses || [])).catch(() => {});
    api.get('/orders').then(r => setOrders(r.data.orders || [])).catch(() => {});
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', { name: profile.name, phone: profile.phone });
      toast.success(`Profile updated successfully, ${profile.name?.split(' ')[0] || 'there'}!`);
    } catch { toast.error('Could not update profile'); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) { toast.error('Passwords do not match'); return; }
    try {
      await api.put('/users/change-password', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password changed successfully! Please use your new password next time.');
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Could not change password'); }
  };

  const deleteAddress = async (id) => {
    try {
      await api.delete(`/users/addresses/${id}`);
      setAddresses(addresses.filter(a => a.address_id !== id));
      toast.success('Address removed from your profile');
    } catch { toast.error('Error deleting address'); }
  };

  const tabs = [
    { id: 'profile', icon: 'fas fa-user', label: 'My Profile' },
    { id: 'addresses', icon: 'fas fa-map-marker-alt', label: 'Addresses' },
    { id: 'orders', icon: 'fas fa-box', label: 'Orders' },
    { id: 'password', icon: 'fas fa-lock', label: 'Security' },
  ];

  return (
    <div className="profile-page page-container">
      <div className="container">
        {/* Profile Banner */}
        <div className="profile-banner card">
          <div className="profile-avatar-lg">
            {profile.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="profile-banner-info">
            <h2>{profile.name || 'User'}</h2>
            <p>{profile.email}</p>
            <p><i className="fas fa-phone"></i> {profile.phone || 'Not added'}</p>
          </div>
          <div className="profile-stats">
            <div><strong>{orders.length}</strong><span>Orders</span></div>
            <div><strong>{addresses.length}</strong><span>Addresses</span></div>
          </div>
        </div>

        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar card">
            {tabs.map(tab => (
              <button key={tab.id}
                className={`profile-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}>
                <i className={tab.icon}></i> {tab.label}
              </button>
            ))}
            <hr />
            <button className="profile-tab-btn logout-btn" onClick={logout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </aside>

          {/* Content */}
          <div className="profile-content">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="card card-body">
                <h3 className="tab-title">Personal Information</h3>
                <form onSubmit={handleProfileSave}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-control"
                        value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input type="tel" className="form-control"
                        value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" value={profile.email} disabled />
                    <small className="form-hint">Email cannot be changed</small>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save"></i> Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="card card-body">
                <h3 className="tab-title">My Addresses</h3>
                {addresses.length === 0 ? (
                  <div className="empty-state" style={{ padding: '30px' }}>
                    <p>No saved addresses yet.</p>
                  </div>
                ) : (
                  <div className="addresses-list">
                    {addresses.map(addr => (
                      <div className="address-card" key={addr.address_id}>
                        <div className="address-info">
                          <strong>{addr.full_name}</strong>
                          <p>{addr.street}, {addr.city}, {addr.state} - {addr.zip_code}</p>
                          <p>{addr.country} · {addr.phone}</p>
                          {addr.is_default && <span className="badge badge-primary">Default</span>}
                        </div>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteAddress(addr.address_id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="card card-body">
                <h3 className="tab-title">Order History</h3>
                {orders.length === 0 ? (
                  <p style={{ color: 'var(--text-light)' }}>No orders found.</p>
                ) : (
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 10).map(o => (
                          <tr key={o.order_id}>
                            <td>#{ o.order_id}</td>
                            <td>{new Date(o.order_date).toLocaleDateString()}</td>
                            <td>₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</td>
                            <td><span className={`badge badge-${o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'danger' : 'warning'}`}>{o.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="card card-body">
                <h3 className="tab-title">Change Password</h3>
                <form onSubmit={handlePasswordChange}>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-control" required
                      value={pwdForm.currentPassword} onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-control" required
                      value={pwdForm.newPassword} onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-control" required
                      value={pwdForm.confirm} onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })} />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-lock"></i> Update Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
