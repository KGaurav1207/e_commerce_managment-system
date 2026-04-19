import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { resolveImageUrl, handleImageError } from '../utils/image';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [newAddress, setNewAddress] = useState({
    full_name: '', phone: '', street: '', city: '', state: '', country: 'India', zip_code: '', is_default: false
  });

  const items = cart.items || [];
  const subtotal = parseFloat(cart.totalAmount) || 0;
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal + shipping;

  useEffect(() => {
    api.get('/users/addresses').then(r => {
      setAddresses(r.data.addresses || []);
      const def = r.data.addresses?.find(a => a.is_default);
      if (def) setSelectedAddress(def.address_id);
    }).catch(() => {});
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/addresses', newAddress);
      toast.success('Address added!');
      const addrRes = await api.get('/users/addresses');
      setAddresses(addrRes.data.addresses || []);
      setSelectedAddress(res.data.address_id);
    } catch { toast.error('Could not save address'); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.warning('Please select a delivery address'); return; }
    setLoading(true);
    try {
      const orderItems = items.map(i => ({ product_id: i.product_id, quantity: i.quantity }));
      const res = await api.post('/orders', {
        address_id: selectedAddress,
        payment_method: paymentMethod,
        items: orderItems
      });
      toast.success('Order placed successfully! 🎉');
      await fetchCart();
      navigate(`/orders/${res.data.order_id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
    } finally { setLoading(false); }
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
                      <label key={addr.address_id} className={`address-option ${selectedAddress == addr.address_id ? 'selected' : ''}`}>
                        <input type="radio" name="address" value={addr.address_id}
                          checked={selectedAddress == addr.address_id}
                          onChange={() => setSelectedAddress(addr.address_id)} />
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
                      <div><strong>{item.name}</strong><span>Qty: {item.quantity}</span></div>
                      <span className="review-item-price">₹{((item.discount_price || item.price) * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
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
    </div>
  );
};

export default CheckoutPage;
