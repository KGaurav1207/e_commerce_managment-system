import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './PaymentGateway.css';

const PaymentGateway = ({ onPaymentSuccess, onPaymentCancel, amount, orderId, userInfo, paymentMethod }) => {
  // Map checkout payment methods to gateway methods
  const getGatewayMethod = (method) => {
    switch (method) {
      case 'credit_card':
      case 'debit_card':
        return 'card';
      default:
        return method || 'card';
    }
  };
  
  const [selectedMethod, setSelectedMethod] = useState(getGatewayMethod(paymentMethod));
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    upiId: '',
    bankName: '',
    walletType: ''
  });

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'fas fa-credit-card',
      description: 'Visa, Mastercard, Rupay'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: 'fas fa-mobile-alt',
      description: 'Google Pay, PhonePe, BHIM'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: 'fas fa-university',
      description: 'All major banks'
    },
    {
      id: 'wallet',
      name: 'Wallet',
      icon: 'fas fa-wallet',
      description: 'Paytm, PhonePe Wallet'
    }
  ];

  const banks = [
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Punjab National Bank',
    'Bank of Baroda',
    'Canara Bank',
    'Union Bank of India'
  ];

  const wallets = [
    'Paytm Wallet',
    'PhonePe Wallet',
    'Amazon Pay',
    'Freecharge',
    'MobiKwik'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number (add spaces every 4 digits)
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\s/g, '');
      const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    // Format expiry (MM/YY)
    if (name === 'expiry') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length >= 3) {
        setFormData(prev => ({ ...prev, [name]: cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) }));
        return;
      }
    }
    
    // Only numbers for CVV
    if (name === 'cvv') {
      if (/^\d*$/.test(value) && value.length <= 3) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (selectedMethod === 'card') {
      const cardNumber = formData.cardNumber.replace(/\s/g, '');
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        toast.error('Please enter a valid card number');
        return false;
      }
      if (!formData.cardName.trim()) {
        toast.error('Please enter cardholder name');
        return false;
      }
      if (!formData.expiry.match(/^\d{2}\/\d{2}$/)) {
        toast.error('Please enter valid expiry date (MM/YY)');
        return false;
      }
      if (!formData.cvv.match(/^\d{3}$/)) {
        toast.error('Please enter valid CVV');
        return false;
      }
    }
    
    if (selectedMethod === 'upi' && !formData.upiId.trim()) {
      toast.error('Please enter UPI ID');
      return false;
    }
    
    if (selectedMethod === 'netbanking' && !formData.bankName) {
      toast.error('Please select your bank');
      return false;
    }
    
    if (selectedMethod === 'wallet' && !formData.walletType) {
      toast.error('Please select wallet type');
      return false;
    }
    
    return true;
  };

  const processPayment = async () => {
    if (!validateForm()) return;
    
    setProcessing(true);
    
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Always succeed for demo purposes (remove random failure)
      const paymentData = {
        orderId,
        amount,
        method: paymentMethod || selectedMethod, // Return original payment method from checkout
        gatewayMethod: selectedMethod, // Keep gateway method for reference
        transactionId: 'TXN' + Date.now(),
        timestamp: new Date().toISOString(),
        status: 'success',
        formData: formData // Include form data for backend processing
      };
      
      toast.success(`Payment of ₹${parseFloat(amount).toLocaleString('en-IN')} successful!`);
      onPaymentSuccess(paymentData);
    } catch (error) {
      toast.error('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          <div className="payment-form">
            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cardholder Name</label>
              <input
                type="text"
                name="cardName"
                value={formData.cardName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="form-control"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Expiry Date</label>
                <input
                  type="text"
                  name="expiry"
                  value={formData.expiry}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  maxLength="5"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label className="form-label">CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  maxLength="3"
                  className="form-control"
                />
              </div>
            </div>
          </div>
        );
        
      case 'upi':
        return (
          <div className="payment-form">
            <div className="form-group">
              <label className="form-label">UPI ID</label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleInputChange}
                placeholder="username@paytm"
                className="form-control"
              />
            </div>
            <div className="upi-info">
              <p>You will receive a payment request on your UPI app</p>
            </div>
          </div>
        );
        
      case 'netbanking':
        return (
          <div className="payment-form">
            <div className="form-group">
              <label className="form-label">Select Bank</label>
              <select
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="">Choose your bank</option>
                {banks.map(bank => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>
            <div className="netbanking-info">
              <p>You will be redirected to your bank's secure payment page</p>
            </div>
          </div>
        );
        
      case 'wallet':
        return (
          <div className="payment-form">
            <div className="form-group">
              <label className="form-label">Select Wallet</label>
              <select
                name="walletType"
                value={formData.walletType}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="">Choose your wallet</option>
                {wallets.map(wallet => (
                  <option key={wallet} value={wallet}>{wallet}</option>
                ))}
              </select>
            </div>
            <div className="wallet-info">
              <p>You will be redirected to your wallet's payment page</p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="payment-gateway">
      <div className="payment-header">
        <h2>Secure Payment</h2>
        <div className="amount-display">
          <span className="amount-label">Amount to Pay:</span>
          <span className="amount-value">₹{amount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="payment-methods">
        {paymentMethods.map(method => (
          <button
            key={method.id}
            className={`payment-method-btn ${selectedMethod === method.id ? 'active' : ''}`}
            onClick={() => setSelectedMethod(method.id)}
          >
            <i className={method.icon}></i>
            <div className="method-info">
              <strong>{method.name}</strong>
              <span>{method.description}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="payment-details">
        {renderPaymentForm()}
      </div>

      <div className="payment-actions">
        <button 
          className="btn btn-outline" 
          onClick={onPaymentCancel}
          disabled={processing}
        >
          Cancel
        </button>
        <button 
          className="btn btn-primary btn-lg" 
          onClick={processPayment}
          disabled={processing}
        >
          {processing ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Processing...
            </>
          ) : (
            <>
              <i className="fas fa-lock"></i>
              Pay ₹{amount.toLocaleString('en-IN')}
            </>
          )}
        </button>
      </div>

      <div className="security-info">
        <div className="security-badges">
          <i className="fas fa-shield-alt"></i>
          <span>Secured by 256-bit SSL encryption</span>
        </div>
        <div className="accepted-cards">
          <span>We accept:</span>
          <i className="fab fa-cc-visa"></i>
          <i className="fab fa-cc-mastercard"></i>
          <i className="fab fa-cc-amex"></i>
          <i className="fab fa-cc-rupay"></i>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;
