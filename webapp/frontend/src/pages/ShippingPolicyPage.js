import React from 'react';
import './ShippingPolicyPage.css';

const ShippingPolicyPage = () => {
  return (
    <div className="shipping-policy-page">
      <div className="container">
        <div className="policy-header">
          <h1>Shipping Policy</h1>
          <p>Everything you need to know about our shipping services and delivery options</p>
        </div>

        <div className="policy-content">
          <section className="policy-section">
            <h2>Delivery Options</h2>
            <div className="delivery-options">
              <div className="option-card">
                <h3>Standard Delivery</h3>
                <p className="time">5-7 business days</p>
                <p className="price">Free on orders above Rs. 500</p>
                <p className="details">Rs. 40 for orders below Rs. 500</p>
              </div>
              <div className="option-card">
                <h3>Express Delivery</h3>
                <p className="time">2-3 business days</p>
                <p className="price">Rs. 120</p>
                <p className="details">Available for all orders</p>
              </div>
              <div className="option-card">
                <h3>Same Day Delivery</h3>
                <p className="time">Within 24 hours</p>
                <p className="price">Rs. 200</p>
                <p className="details">Available in select cities, order before 12 PM</p>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Shipping Coverage</h2>
            <div className="coverage-info">
              <h3>We deliver to:</h3>
              <ul>
                <li>All major cities across India</li>
                <li>Most towns and villages (through our partner network)</li>
                <li>Over 20,000 pin codes nationwide</li>
              </ul>
              <h3>Currently not available in:</h3>
              <ul>
                <li>Remote islands and extreme remote locations</li>
                <li>Areas with access restrictions</li>
              </ul>
            </div>
          </section>

          <section className="policy-section">
            <h2>Order Processing Time</h2>
            <div className="processing-info">
              <p>Most orders are processed within 1-2 business days. During high-demand periods (like festivals or sales), processing may take up to 3 business days.</p>
              <p>You'll receive an email confirmation once your order ships with tracking information.</p>
            </div>
          </section>

          <section className="policy-section">
            <h2>Delivery Times</h2>
            <div className="delivery-times">
              <div className="time-info">
                <h3>Business Days</h3>
                <p>Monday - Saturday (excluding public holidays)</p>
              </div>
              <div className="time-info">
                <h3>Delivery Hours</h3>
                <p>9:00 AM - 7:00 PM (local time)</p>
              </div>
              <div className="time-info">
                <h3>Weekend Delivery</h3>
                <p>Available in select cities for Express and Same Day delivery</p>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Tracking Your Order</h2>
            <div className="tracking-info">
              <p>Once your order ships, you can:</p>
              <ul>
                <li>Track your order through our website using your order number</li>
                <li>Receive real-time updates via SMS and email</li>
                <li>Contact our delivery partner directly with your tracking number</li>
              </ul>
            </div>
          </section>

          <section className="policy-section">
            <h2>Failed Delivery Attempts</h2>
            <div className="failed-delivery">
              <p>If delivery fails due to:</p>
              <ul>
                <li><strong>Address not found:</strong> We'll contact you to confirm the address and retry delivery</li>
                <li><strong>Recipient unavailable:</strong> We'll attempt delivery 2 more times on consecutive days</li>
                <li><strong>Refused delivery:</strong> Order will be returned to our warehouse and refund processed</li>
              </ul>
            </div>
          </section>

          <section className="policy-section">
            <h2>Shipping Charges</h2>
            <div className="shipping-charges">
              <table>
                <thead>
                  <tr>
                    <th>Order Value</th>
                    <th>Standard</th>
                    <th>Express</th>
                    <th>Same Day</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Up to Rs. 500</td>
                    <td>Rs. 40</td>
                    <td>Rs. 120</td>
                    <td>Rs. 200</td>
                  </tr>
                  <tr>
                    <td>Rs. 501 - Rs. 1000</td>
                    <td>Rs. 30</td>
                    <td>Rs. 100</td>
                    <td>Rs. 180</td>
                  </tr>
                  <tr>
                    <td>Above Rs. 1000</td>
                    <td>FREE</td>
                    <td>Rs. 80</td>
                    <td>Rs. 150</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="contact-info">
          <h2>Need Help with Shipping?</h2>
          <p>Our customer support team is available to assist you with any shipping-related questions.</p>
          <div className="contact-options">
            <a href="mailto:support@shopmart.com" className="contact-btn">
              <i className="fas fa-envelope"></i> Email Support
            </a>
            <a href="tel:+919876543210" className="contact-btn">
              <i className="fas fa-phone"></i> Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;
