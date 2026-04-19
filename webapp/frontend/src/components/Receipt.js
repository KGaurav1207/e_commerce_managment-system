import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './Receipt.css';

const Receipt = ({ orderData, userType = 'user' }) => {
  const [downloading, setDownloading] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const generateReceiptNumber = () => {
    return `RCT${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      // Create receipt content
      const receiptContent = generateReceiptHTML();
      
      // Create a temporary blob and download
      const blob = new Blob([receiptContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${orderData.order_id}_${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download receipt');
    } finally {
      setDownloading(false);
    }
  };

  const printReceipt = () => {
    const receiptContent = generateReceiptHTML();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const generateReceiptHTML = () => {
    const receiptNumber = generateReceiptNumber();
    const subtotal = parseFloat(orderData.total_amount) - parseFloat(orderData.shipping_cost || 0);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - Order #${orderData.order_id}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #2d2d2d;
            background: #f8f9fa;
            padding: 20px;
        }
        .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .receipt-header {
            background: linear-gradient(135deg, #FF6B00, #e55a00);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .receipt-header h1 {
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 8px;
        }
        .receipt-header p {
            opacity: 0.9;
            font-size: 14px;
        }
        .receipt-body {
            padding: 30px;
        }
        .receipt-section {
            margin-bottom: 30px;
        }
        .receipt-section h3 {
            font-size: 16px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #FF6B00;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }
        .info-item {
            display: flex;
            flex-direction: column;
        }
        .info-label {
            font-size: 12px;
            color: #6c757d;
            font-weight: 600;
            margin-bottom: 4px;
        }
        .info-value {
            font-size: 14px;
            color: #2d2d2d;
            font-weight: 500;
        }
        .order-items {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
        }
        .order-item {
            display: flex;
            align-items: center;
            padding: 16px;
            border-bottom: 1px solid #dee2e6;
        }
        .order-item:last-child {
            border-bottom: none;
        }
        .item-image {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            object-fit: cover;
            margin-right: 16px;
        }
        .item-details {
            flex: 1;
        }
        .item-name {
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 4px;
        }
        .item-quantity {
            font-size: 12px;
            color: #6c757d;
        }
        .item-price {
            font-weight: 700;
            font-size: 16px;
            color: #FF6B00;
        }
        .price-summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
        }
        .price-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .price-row.total {
            font-size: 18px;
            font-weight: 800;
            color: #1a1a2e;
            padding-top: 12px;
            border-top: 2px solid #dee2e6;
        }
        .receipt-footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #dee2e6;
        }
        .receipt-footer p {
            font-size: 12px;
            color: #6c757d;
            margin-bottom: 8px;
        }
        .receipt-footer .thank-you {
            font-size: 16px;
            font-weight: 700;
            color: #1a1a2e;
            margin-bottom: 8px;
        }
        @media print {
            body { padding: 0; }
            .receipt-container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="receipt-header">
            <h1>🛒 ShopMart</h1>
            <p>Payment Receipt</p>
            <p><strong>Receipt #${receiptNumber}</strong></p>
        </div>
        
        <div class="receipt-body">
            <div class="receipt-section">
                <h3>Order Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Order ID</span>
                        <span class="info-value">#${orderData.order_id}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Order Date</span>
                        <span class="info-value">${formatDate(orderData.created_at)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Payment Method</span>
                        <span class="info-value">${orderData.payment_method?.replace('_', ' ').toUpperCase() || 'CASH ON DELIVERY'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Payment Status</span>
                        <span class="info-value" style="color: #28a745; font-weight: 700;">PAID</span>
                    </div>
                </div>
            </div>
            
            ${orderData.shipping_address ? `
            <div class="receipt-section">
                <h3>Delivery Address</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Recipient</span>
                        <span class="info-value">${orderData.shipping_address.full_name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Phone</span>
                        <span class="info-value">${orderData.shipping_address.phone}</span>
                    </div>
                    <div class="info-item" style="grid-column: 1 / -1;">
                        <span class="info-label">Address</span>
                        <span class="info-value">${orderData.shipping_address.street}, ${orderData.shipping_address.city}, ${orderData.shipping_address.state} - ${orderData.shipping_address.zip_code}</span>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <div class="receipt-section">
                <h3>Order Items</h3>
                <div class="order-items">
                    ${orderData.items?.map(item => `
                        <div class="order-item">
                            <img src="${item.image_url || 'https://via.placeholder.com/60x60'}" alt="${item.name}" class="item-image">
                            <div class="item-details">
                                <div class="item-name">${item.name}</div>
                                <div class="item-quantity">Quantity: ${item.quantity}</div>
                            </div>
                            <div class="item-price">${formatCurrency((item.discount_price || item.price) * item.quantity)}</div>
                        </div>
                    `).join('') || ''}
                </div>
            </div>
            
            <div class="receipt-section">
                <h3>Price Summary</h3>
                <div class="price-summary">
                    <div class="price-row">
                        <span>Subtotal</span>
                        <span>${formatCurrency(subtotal)}</span>
                    </div>
                    <div class="price-row">
                        <span>Shipping</span>
                        <span>${orderData.shipping_cost > 0 ? formatCurrency(orderData.shipping_cost) : 'FREE'}</span>
                    </div>
                    ${orderData.discount_amount > 0 ? `
                    <div class="price-row">
                        <span>Discount</span>
                        <span style="color: #28a745;">-${formatCurrency(orderData.discount_amount)}</span>
                    </div>
                    ` : ''}
                    <div class="price-row total">
                        <span>Total Paid</span>
                        <span>${formatCurrency(orderData.total_amount)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="receipt-footer">
            <p class="thank-you">Thank you for shopping with ShopMart! 🎉</p>
            <p>This is a computer-generated receipt and does not require a signature.</p>
            <p>For any queries, please contact our customer support at support@shopmart.com</p>
        </div>
    </div>
</body>
</html>
    `;
  };

  const subtotal = parseFloat(orderData.total_amount) - parseFloat(orderData.shipping_cost || 0);

  return (
    <div className="receipt">
      <div className="receipt-header">
        <div className="receipt-header-content">
          <div className="receipt-title">
            <h2>
              <i className="fas fa-receipt"></i>
              {userType === 'admin' ? 'Order Receipt' : 'Your Receipt'}
            </h2>
            <p>Order #{orderData.order_id}</p>
          </div>
          <div className="receipt-actions">
            <button 
              className="btn btn-outline btn-sm" 
              onClick={printReceipt}
              title="Print Receipt"
            >
              <i className="fas fa-print"></i> Print
            </button>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={downloadPDF}
              disabled={downloading}
              title="Download Receipt"
            >
              {downloading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Downloading...
                </>
              ) : (
                <>
                  <i className="fas fa-download"></i> Download
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="receipt-body">
        <div className="receipt-section">
          <h3>Order Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Order ID</span>
              <span className="info-value">#{orderData.order_id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Order Date</span>
              <span className="info-value">{formatDate(orderData.created_at)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Payment Method</span>
              <span className="info-value">
                {orderData.payment_method?.replace('_', ' ').toUpperCase() || 'CASH ON DELIVERY'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Payment Status</span>
              <span className="info-value status-paid">PAID</span>
            </div>
          </div>
        </div>

        {orderData.shipping_address && (
          <div className="receipt-section">
            <h3>Delivery Address</h3>
            <div className="address-info">
              <p><strong>{orderData.shipping_address.full_name}</strong></p>
              <p>{orderData.shipping_address.phone}</p>
              <p>{orderData.shipping_address.street}, {orderData.shipping_address.city}, {orderData.shipping_address.state} - {orderData.shipping_address.zip_code}</p>
            </div>
          </div>
        )}

        <div className="receipt-section">
          <h3>Order Items</h3>
          <div className="order-items">
            {orderData.items?.map(item => (
              <div key={item.order_item_id || item.product_id} className="order-item">
                <img 
                  src={item.image_url || 'https://via.placeholder.com/60x60'} 
                  alt={item.name}
                  className="item-image"
                />
                <div className="item-details">
                  <div className="item-name">{item.name}</div>
                  <div className="item-quantity">Quantity: {item.quantity}</div>
                </div>
                <div className="item-price">
                  {formatCurrency((item.discount_price || item.price) * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="receipt-section">
          <h3>Price Summary</h3>
          <div className="price-summary">
            <div className="price-row">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="price-row">
              <span>Shipping</span>
              <span>{orderData.shipping_cost > 0 ? formatCurrency(orderData.shipping_cost) : 'FREE'}</span>
            </div>
            {orderData.discount_amount > 0 && (
              <div className="price-row">
                <span>Discount</span>
                <span className="discount-amount">-{formatCurrency(orderData.discount_amount)}</span>
              </div>
            )}
            <div className="price-row total">
              <span>Total Paid</span>
              <span>{formatCurrency(orderData.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="receipt-footer">
        <p className="thank-you">Thank you for shopping with ShopMart! 🎉</p>
        <p>This is a computer-generated receipt and does not require a signature.</p>
        <p>For any queries, please contact our customer support at support@shopmart.com</p>
      </div>
    </div>
  );
};

export default Receipt;
