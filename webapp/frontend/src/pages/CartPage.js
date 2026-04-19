import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { resolveImageUrl, handleImageError } from '../utils/image';
import './CartPage.css';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const items = cart.items || [];
  const subtotal = parseFloat(cart.totalAmount) || 0;
  const shipping = subtotal > 499 ? 0 : 49;
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const total = subtotal + shipping - discount;

  const handleRemove = async (productId, productName) => {
    try {
      await removeFromCart(productId);
      toast.success(`${productName} removed from your cart`);
    } catch { toast.error('Could not remove item from cart'); }
  };

  const handleCouponApply = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setLoadingCoupon(true);
    try {
      const response = await api.post('/coupons/validate', { 
        code: couponCode.trim(),
        order_amount: subtotal 
      });

      if (response.data.success) {
        const coupon = response.data.coupon;
        const discountValue = parseFloat(coupon.discount_value) || 0;
        let discountAmount = 0;

        if (coupon.discount_type === 'percentage') {
          discountAmount = (subtotal * discountValue) / 100;
        } else {
          discountAmount = discountValue;
        }

        setDiscount(parseFloat(discountAmount) || 0);
        setAppliedCoupon(coupon);
        toast.success(`Coupon ${coupon.code} applied! You saved ₹${discountAmount.toFixed(2)}`);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error applying coupon');
    } finally {
      setLoadingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscount(0);
    toast.info(`Coupon ${appliedCoupon?.code} removed`);
  };

  const openCouponModal = async () => {
    setShowCouponModal(true);
    setLoadingCoupons(true);
    try {
      const res = await api.get(`/coupons/eligible?amount=${subtotal}`);
      if (res.data.success) setAvailableCoupons(res.data.coupons);
    } catch {
      toast.error('Could not load coupons');
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleSelectCoupon = (code) => {
    setCouponCode(code);
    setShowCouponModal(false);
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
                  <div className="cart-item" key={item.product_id}>
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
                      <button className="remove-btn" onClick={() => handleRemove(item.product_id, item.name)}>
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
              {discount > 0 && (
                <div className="summary-row discount-row">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span className="discount-amount">-₹{discount.toFixed(2)}</span>
                </div>
              )}
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
              <button 
                className="btn btn-primary btn-full btn-lg" 
                onClick={() => navigate('/checkout', { state: { coupon: appliedCoupon } })}
              >
                Proceed to Checkout <i className="fas fa-arrow-right"></i>
              </button>
              <div className="secure-badge">
                <i className="fas fa-lock"></i> Secure Checkout
              </div>
            </div>

            <div className="promo-card-sm card card-body">
              <h4><i className="fas fa-tag"></i> Have a coupon?</h4>
              <div className="promo-input">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={loadingCoupon || !!appliedCoupon}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleCouponApply}
                  disabled={loadingCoupon || !!appliedCoupon}
                >
                  {loadingCoupon ? <><i className="fas fa-spinner fa-spin"></i> Applying...</> : 'Apply'}
                </button>
              </div>
              {!appliedCoupon && (
                <button className="view-coupons-btn" onClick={openCouponModal}>
                  <i className="fas fa-ticket-alt"></i> View available coupons
                </button>
              )}
              {appliedCoupon && (
                <div className="applied-coupon">
                  <span className="coupon-success">
                    <i className="fas fa-check-circle"></i>
                    {appliedCoupon.code} applied!
                  </span>
                  <span className="coupon-discount">-₹{discount.toFixed(2)} off</span>
                  <button className="coupon-remove" onClick={handleRemoveCoupon}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Available Coupons Modal */}
      {showCouponModal && (
        <div className="coupon-modal-overlay" onClick={() => setShowCouponModal(false)}>
          <div className="coupon-modal" onClick={e => e.stopPropagation()}>
            <div className="coupon-modal-header">
              <h3><i className="fas fa-ticket-alt" style={{ color: 'var(--primary)', marginRight: 8 }}></i>Available Coupons</h3>
              <button className="coupon-modal-close" onClick={() => setShowCouponModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="coupon-modal-body">
              {loadingCoupons ? (
                <div className="spinner-wrapper" style={{ minHeight: 120 }}>
                  <div className="spinner"></div>
                </div>
              ) : availableCoupons.length === 0 ? (
                <div className="coupon-modal-empty">
                  <div><i className="fas fa-ticket-alt"></i></div>
                  <p>No coupons available right now.</p>
                </div>
              ) : (
                availableCoupons.map(coupon => {
                  const minAmt = parseFloat(coupon.minimum_amount) || 0;
                  const shortfall = minAmt - subtotal;
                  const canApply = coupon.applicable && !coupon.already_used && !coupon.limit_reached;

                  return (
                    <div
                      key={coupon.coupon_id}
                      className={`coupon-card ${coupon.applicable ? 'applicable' : 'not-applicable'} ${coupon.already_used ? 'already-used' : ''}`}
                    >
                      <div className="coupon-card-top">
                        <span className="coupon-code-tag">{coupon.code}</span>
                        <div className="coupon-badge-row">
                          <span className={`coupon-discount-badge ${coupon.discount_type}`}>
                            {coupon.discount_type === 'percentage'
                              ? `${parseFloat(coupon.discount_value)}% OFF`
                              : `₹${parseFloat(coupon.discount_value)} OFF`}
                          </span>
                        </div>
                      </div>

                      {coupon.description && (
                        <p className="coupon-card-desc">{coupon.description}</p>
                      )}

                      <div className="coupon-card-meta">
                        {minAmt > 0 && (
                          <span><i className="fas fa-shopping-bag"></i> Min order ₹{minAmt.toLocaleString('en-IN')}</span>
                        )}
                        {coupon.usage_limit && (
                          <span><i className="fas fa-users"></i> {coupon.usage_count}/{coupon.usage_limit} used</span>
                        )}
                        {coupon.end_date && (
                          <span><i className="fas fa-calendar-alt"></i> Expires {new Date(coupon.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        )}
                      </div>

                      <div className="coupon-card-footer">
                        <span className={`coupon-status-tag ${
                          coupon.already_used ? 'used'
                            : coupon.limit_reached ? 'maxed'
                            : coupon.applicable ? 'eligible'
                            : 'need-more'
                        }`}>
                          {coupon.already_used ? 'Already used'
                            : coupon.limit_reached ? 'Limit reached'
                            : coupon.applicable ? 'Eligible'
                            : `Add ₹${shortfall.toLocaleString('en-IN')} more`}
                        </span>
                        <button
                          className="apply-coupon-btn"
                          disabled={!canApply}
                          onClick={() => handleSelectCoupon(coupon.code)}
                        >
                          {coupon.already_used ? 'Used' : coupon.limit_reached ? 'Unavailable' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
