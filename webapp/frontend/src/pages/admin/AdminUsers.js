import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import AdminLayout from './AdminLayout';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data.users || [])).finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? users.filter(u => {
        const q = search.toLowerCase();
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        return name.includes(q) || email.includes(q);
      })
    : users;

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h2>👥 Customer Management</h2>
        <input type="text" className="form-control" style={{ width: 280 }}
          placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="admin-table-section">
        <div className="admin-table-header">
          <h3>All Customers ({filtered.length})</h3>
        </div>
        <div className="table-wrapper">
          {loading ? <div className="spinner-wrapper"><div className="spinner"></div></div> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Registered On</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.user_id}>
                    <td>#{u.user_id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <strong>{u.name}</strong>
                      </div>
                    </td>
                    <td>{u.email || '—'}</td>
                    <td>{u.phone || '—'}</td>
                    <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
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

export default AdminUsers;
