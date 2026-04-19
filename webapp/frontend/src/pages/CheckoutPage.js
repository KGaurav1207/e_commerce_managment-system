import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { resolveImageUrl, handleImageError } from '../utils/image';
import PaymentGateway from '../components/PaymentGateway';
import Receipt from '../components/Receipt';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const defaultAddress = {
    full_name: '', phone: '', street: '', city: '', state: '', country: 'India', zip_code: '', is_default: false
  };
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [newAddress, setNewAddress] = useState(defaultAddress);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const items = cart.items || [];
  const subtotal = parseFloat(cart.totalAmount) || 0;
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal + shipping - (appliedCoupon?.discount_amount || 0);

  useEffect(() => {
    api.get('/users/addresses').then(r => {
      setAddresses(r.data.addresses || []);
      const def = r.data.addresses?.find(a => a.is_default);
      if (def?.address_id != null) setSelectedAddress(String(def.address_id));
      else if (r.data.addresses?.[0]?.address_id != null) setSelectedAddress(String(r.data.addresses[0].address_id));
    }).catch(() => {});
  }, []);

  // Handle coupon passed from CartPage
  useEffect(() => {
    if (location.state?.coupon) {
      setAppliedCoupon(location.state.coupon);
      // Clear the coupon from location state after applying
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/addresses', newAddress);
      toast.success('Delivery address saved successfully!');
      const addrRes = await api.get('/users/addresses');
      setAddresses(addrRes.data.addresses || []);
      setSelectedAddress(String(res.data.address_id));
      setNewAddress(defaultAddress);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.warning('Please select a delivery address'); return; }
    setLoading(true);
    try {
      const orderItems = items.map(i => ({ product_id: i.product_id, quantity: i.quantity }));
      
      // Apply coupon if exists
      let couponData = null;
      if (appliedCoupon) {
        try {
          const applyRes = await api.post('/coupons/apply', {
            code: appliedCoupon.code,
            order_id: 'temp', // Will be updated with actual order ID
            discount_amount: appliedCoupon.discount_amount
          });
          
          if (applyRes.data.success) {
            couponData = applyRes.data.coupon;
          }
        } catch (error) {
          console.error('Coupon application error:', error);
        }
      }
      
      const res = await api.post('/orders', {
        address_id: selectedAddress,
        payment_method: paymentMethod,
        items: orderItems,
        coupon_id: couponData?.coupon_id
      });
      
      const orderData = {
        order_id: res.data.order_id,
        total_amount: res.data.total_amount || total
      };
      
      setCurrentOrder(orderData);
      
      // If payment method is not COD, show payment gateway
      if (paymentMethod !== 'cod') {
        setShowPaymentGateway(true);
      } else {
        // For COD, place order directly and show receipt
        await handleOrderSuccess(orderData);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
    } finally { setLoading(false); }
  };

  const handlePaymentSuccess = async (paymentData) => {
    if (!currentOrder) return;
    
    // For dummy gateway, skip backend processing and go directly to receipt
    // The payment is already "processed" by the frontend gateway
    await handleOrderSuccess(currentOrder);
  };

  const handlePaymentCancel = () => {
    setShowPaymentGateway(false);
    toast.info('Payment cancelled. You can try again.');
  };

  const handleOrderSuccess = async (orderData) => {
    // Close payment gateway modal
    setShowPaymentGateway(false);
    
    try {
      // Get order details to create receipt
      const orderRes = await api.get(`/orders/${orderData.order_id}`);
      if (orderRes.data.success) {
        // Create receipt data from order response
        const receiptData = {
          order_id: orderData.order_id,
          created_at: orderRes.data.order.order_date,
          total_amount: orderRes.data.order.total_amount,
          payment_method: paymentMethod,
          status: 'paid',
          shipping_cost: orderData.total_amount > 499 ? 0 : 49,
          discount_amount: 0,
          shipping_address: null, // Would need to be populated from order
          items: orderRes.data.items || [],
          payment: {
            transaction_id: 'TXN' + Date.now(),
            payment_method: paymentMethod,
            amount: orderData.total_amount,
            status: 'success',
            payment_date: new Date().toISOString()
          }
        };
        
        setReceiptData(receiptData);
        setShowReceipt(true);
      }
      
      toast.success(`Order #${orderData.order_id} placed successfully! We'll notify you when it ships.`);
      await fetchCart();
    } catch (err) {
      console.error('Failed to generate receipt:', err);
      toast.success(`Order #${orderData.order_id} placed successfully! We'll notify you when it ships.`);
      await fetchCart();
      navigate(`/orders/${orderData.order_id}`);
    }
  };

  const paymentMethods = [
    { id: 'cod', icon: 'fas fa-money-bill-wave', label: 'Cash on Delivery', desc: 'Pay when you receive' },
    { id: 'upi', icon: 'fas fa-mobile-alt', label: 'UPI', desc: 'Google Pay, PhonePe, BHIM' },
    { id: 'credit_card', icon: 'fas fa-credit-card', label: 'Credit Card', desc: 'Visa, Mastercard, Rupay' },
    { id: 'debit_card', icon: 'fas fa-credit-card', label: 'Debit Card', desc: 'All major banks' },
    { id: 'netbanking', icon: 'fas fa-university', label: 'Net Banking', desc: 'All major banks' },
    { id: 'wallet', icon: 'fas fa-wallet', label: 'Wallet', desc: 'Paytm, PhonePe wallet' },
  ];

  return (
    <div className="checkout-page page-container">
      <div className="container">
        <h1 className="section-title">Checkout</h1>

        {/* Steps */}
        <div className="checkout-steps">
          {['Address', 'Payment', 'Review'].map((s, i) => (
            <div key={s} className={`step ${step >= i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
              <div className="step-num">{step > i + 1 ? <i className="fas fa-check"></i> : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="checkout-section card card-body">
                <h2><i className="fas fa-map-marker-alt"></i> Delivery Address</h2>

                {addresses.length > 0 && (
                  <div className="saved-addresses">
                    <h4>Saved Addresses</h4>
                    {addresses.map(addr => (
                      <label key={addr.address_id} className={`address-option ${selectedAddress === String(addr.address_id) ? 'selected' : ''}`}>
                        <input type="radio" name="address" value={addr.address_id}
                          checked={selectedAddress === String(addr.address_id)}
                          onChange={() => setSelectedAddress(String(addr.address_id))} />
                        <div>
                          <strong>{addr.full_name}</strong> · {addr.phone}
                          <p>{addr.street}, {addr.city}, {addr.state} - {addr.zip_code}</p>
                          <p>{addr.country}</p>
                          {addr.is_default && <span className="badge badge-primary">Default</span>}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <div className="add-address-form">
                  <h4>+ Add New Address</h4>
                  <form onSubmit={handleAddAddress}>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" className="form-control" required
                          value={newAddress.full_name} onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input type="tel" className="form-control" required
                          value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Street Address</label>
                      <input type="text" className="form-control" required
                        value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input type="text" className="form-control" required
                          value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">State</label>
                        <input type="text" className="form-control" required
                          value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Zip Code</label>
                        <input type="text" className="form-control"
                          value={newAddress.zip_code} onChange={e => setNewAddress({ ...newAddress, zip_code: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Country</label>
                        <input type="text" className="form-control"
                          value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-outline btn-sm">Save Address</button>
                  </form>
                </div>

                <button className="btn btn-primary" onClick={() => { if (selectedAddress) setStep(2); else toast.warning('Select an address'); }}>
                  Continue to Payment <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="checkout-section card card-body">
                <h2><i className="fas fa-credit-card"></i> Payment Method</h2>
                <div className="payment-methods">
                  {paymentMethods.map(pm => (
                    <label key={pm.id} className={`payment-option ${paymentMethod === pm.id ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value={pm.id}
                        checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} />
                      <i className={pm.icon}></i>
                      <div><strong>{pm.label}</strong><span>{pm.desc}</span></div>
                    </label>
                  ))}
                </div>
                <div className="step-btns">
                  <button className="btn btn-outline" onClick={() => setStep(1)}><i className="fas fa-arrow-left"></i> Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(3)}>Review Order <i className="fas fa-arrow-right"></i></button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="checkout-section card card-body">
                <h2><i className="fas fa-check-circle"></i> Review Your Order</h2>
                <div className="review-items">
                  {items.map(item => (
                    <div className="review-item-row" key={item.cart_item_id}>
                      <img
                        src={resolveImageUrl({ imageUrl: item.image_url, name: item.name, size: '60x60' })}
                        alt={item.name}
                        onError={(e) => handleImageError(e, { name: item.name, size: '60x60' })}
                      />
                      <div key={`info-${item.cart_item_id}`}><strong>{item.name}</strong><span>Qty: {item.quantity}</span></div>
                      <span className="review-item-price">₹{((item.discount_price || item.price) * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                {appliedCoupon && (
                  <div className="coupon-display">
                    <span className="applied-coupon-info">
                      <i className="fas fa-tag"></i>
                      Coupon Applied: {appliedCoupon.code}
                    </span>
                    <span className="coupon-saved">Saved ₹{appliedCoupon.discount_amount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="step-btns">
                  <button className="btn btn-outline" onClick={() => setStep(2)}><i className="fas fa-arrow-left"></i> Back</button>
                  <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={loading}>
                    {loading ? <><i className="fas fa-spinner fa-spin"></i> Placing Order...</> : <>Place Order ₹{total.toLocaleString('en-IN')}</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="checkout-summary card card-body">
            <h3>Order Summary</h3>
            {items.map(item => (
              <div className="summary-item" key={item.cart_item_id}>
                <span>{item.name} × {item.quantity}</span>
                <span>₹{((item.discount_price || item.price) * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <hr />
            <div className="summary-item"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            <div className="summary-item"><span>Shipping</span><span style={{ color: 'var(--success)' }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
            <hr />
            <div className="summary-total">
              <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {showPaymentGateway && currentOrder && (
        <div className="modal-overlay">
          <div className="modal-content payment-modal">
            <button className="modal-close" onClick={handlePaymentCancel}>
              <i className="fas fa-times"></i>
            </button>
            <PaymentGateway
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentCancel={handlePaymentCancel}
              amount={currentOrder.total_amount}
              orderId={currentOrder.order_id}
              userInfo={user}
              paymentMethod={paymentMethod}
            />
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="modal-overlay">
          <div className="modal-content receipt-modal">
            <button className="modal-close" onClick={() => {
              setShowReceipt(false);
              navigate(`/orders/${receiptData.order_id}`);
            }}>
              <i className="fas fa-times"></i>
            </button>
            <Receipt 
              orderData={receiptData} 
              userType="user"
            />
            <div className="receipt-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  setShowReceipt(false);
                  navigate('/orders');
                }}
              >
                View All Orders
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setShowReceipt(false);
                  navigate('/');
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
