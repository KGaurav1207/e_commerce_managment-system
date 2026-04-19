// ============================================================
// Authentication Context
// ============================================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const safeParse = (value) => {
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedAdmin = localStorage.getItem('admin');

    const parsedUser = safeParse(savedUser);
    const parsedAdmin = safeParse(savedAdmin);

    if (token && parsedUser) {
      setUser(parsedUser);
    }
    if (token && parsedAdmin) {
      setIsAdmin(true);
    }

    // Reset corrupted persisted auth state to avoid render-time crashes.
    if (token && savedUser && !parsedUser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('admin');
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.removeItem('admin');
    localStorage.setItem('user', JSON.stringify(user));
    setIsAdmin(false);
    setUser(user);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.removeItem('admin');
    localStorage.setItem('user', JSON.stringify(user));
    setIsAdmin(false);
    setUser(user);
    return res.data;
  };

  const adminLogin = async (email, password) => {
    const res = await api.post('/auth/admin/login', { email, password });
    const { token, admin } = res.data;
    localStorage.setItem('token', token);
    localStorage.removeItem('user');
    localStorage.setItem('admin', JSON.stringify(admin));
    setUser(null);
    setIsAdmin(true);
    return res.data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, register, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
