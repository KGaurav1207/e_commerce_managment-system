// ============================================================
// Cart Context
// ============================================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data);
      setCartCount(res.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0);
    } catch {}
  };

  useEffect(() => {
    if (user) fetchCart();
    else { setCart({ items: [], totalAmount: 0 }); setCartCount(0); }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    await api.post('/cart', { product_id: productId, quantity });
    fetchCart();
  };

  const updateQuantity = async (productId, quantity) => {
    await api.put(`/cart/${productId}`, { quantity });
    fetchCart();
  };

  const removeFromCart = async (productId) => {
    await api.delete(`/cart/${productId}`);
    fetchCart();
  };

  return (
    <CartContext.Provider value={{ cart, cartCount, fetchCart, addToCart, updateQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
