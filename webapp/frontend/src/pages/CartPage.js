import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { resolveImageUrl, handleImageError } from '../utils/image';
import './CartPage.css';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const items = cart.items || [];
  const subtotal = parseFloat(cart.totalAmount) || 0;
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal + shipping;

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success('Item removed from cart');
    } catch { toast.error('Error removing item'); }
  };

  if (items.length === 0) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="empty-state">
            <div className="empty-icon"><i className="fas fa-shopping-cart"></i></div>
            <h3>Your cart is empty</h3>
            <p>Add some products to your cart and they will appear here</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              <i className="fas fa-shopping-bag"></i> Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page-container">
      <div className="container">
        <h1 className="section-title">Shopping Cart <span className="cart-count">({items.length} items)</span></h1>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items-section">
            <div className="card">
              {items.map(item => {
                const price = item.discount_price || item.price;
                const imgSrc = resolveImageUrl({
                  imageUrl: item.image_url,
                  name: item.name,
                  size: '100x100',
                });
                return (
                  <div className="cart-item" key={item.cart_item_id}>
                    <img
                      src={imgSrc}
                      alt={item.name}
                      className="cart-item-img"
                      onError={(e) => handleImageError(e, { name: item.name, size: '100x100' })}
                    />
                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{item.name}</h3>
                      {item.brand && <p className="cart-item-brand">{item.brand}</p>}
                      <div className="cart-item-price">
                        ₹{price.toLocaleString('en-IN')}
                        {item.discount_price && (
                          <span className="cart-orig-price">₹{item.price.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                    <div className="cart-item-qty">
                      <div className="qty-control">
                        <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>
                          <i className="fas fa-minus"></i>
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                      <div className="cart-item-total">₹{(price * item.quantity).toLocaleString('en-IN')}</div>
                      <button className="remove-btn" onClick={() => handleRemove(item.product_id)}>
                        <i className="fas fa-trash"></i> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="cart-actions">
              <Link to="/products" className="btn btn-outline">
                <i className="fas fa-arrow-left"></i> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="cart-summary">
            <div className="summary-card card card-body">
              <h3 className="summary-title">Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'free-ship' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              {shipping > 0 && (
                <p className="free-ship-msg">Add ₹{(499 - subtotal).toFixed(2)} more for free shipping!</p>
              )}
              <div className="summary-divider"></div>
              <div className="summary-total">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/checkout')}>
                Proceed to Checkout <i className="fas fa-arrow-right"></i>
              </button>
              <div className="secure-badge">
                <i className="fas fa-lock"></i> Secure Checkout
              </div>
            </div>

            <div className="promo-card-sm card card-body">
              <h4><i className="fas fa-tag"></i> Have a coupon?</h4>
              <div className="promo-input">
                <input type="text" className="form-control" placeholder="Enter coupon code" />
                <button className="btn btn-primary btn-sm">Apply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
