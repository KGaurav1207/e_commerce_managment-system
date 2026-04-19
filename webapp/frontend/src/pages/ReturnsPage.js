import React from 'react';
import './ReturnsPage.css';

const ReturnsPage = () => {
  return (
    <div className="returns-page">
      <div className="container">
        <div className="returns-header">
          <h1>Returns & Refunds</h1>
          <p>Our hassle-free return policy and refund process</p>
        </div>

        <div className="returns-content">
          <section className="returns-section">
            <h2>Return Policy</h2>
            <div className="policy-highlights">
              <div className="highlight-card">
                <div className="icon">
                  <i className="fas fa-clock"></i>
                </div>
                <h3>30-Day Return Window</h3>
                <p>Return most items within 30 days of delivery</p>
              </div>
              <div className="highlight-card">
                <div className="icon">
                  <i className="fas fa-box"></i>
                </div>
                <h3>Original Condition Required</h3>
                <p>Items must be unused, in original packaging with tags</p>
              </div>
              <div className="highlight-card">
                <div className="icon">
                  <i className="fas fa-money-bill-wave"></i>
                </div>
                <h3>Full Refund</h3>
                <p>Get complete refund for eligible returns</p>
              </div>
            </div>
          </section>

          <section className="returns-section">
            <h2>Items Eligible for Return</h2>
            <div className="eligible-items">
              <div className="item-category">
                <h3>Electronics</h3>
                <ul>
                  <li>Mobile phones, laptops, tablets (15-day return window)</li>
                  <li>Accessories like headphones, chargers, cables</li>
                  <li>Small appliances and gadgets</li>
                </ul>
              </div>
              <div className="item-category">
                <h3>Fashion & Apparel</h3>
                <ul>
                  <li>Clothing, shoes, and accessories</li>
                  <li>Watches and jewelry (with original tags)</li>
                  <li>Bags and luggage</li>
                </ul>
              </div>
              <div className="item-category">
                <h3>Home & Kitchen</h3>
                <ul>
                  <li>Cookware, utensils, and small appliances</li>
                  <li>Home decor and furnishings</li>
                  <li>Bath and bedding items</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="returns-section">
            <h2>Non-Returnable Items</h2>
            <div className="non-eligible-list">
              <ul>
                <li><strong>Perishable items:</strong> Food, flowers, plants</li>
                <li><strong>Personal care items:</strong> Opened cosmetics, hygiene products</li>
                <li><strong>Customized products:</strong> Personalized items, custom-made products</li>
                <li><strong>Undergarments:</strong> For hygiene reasons</li>
                <li><strong>Digital downloads:</strong> Software, ebooks, music</li>
                <li><strong>Items damaged by customer:</strong> Misuse, improper installation</li>
                <li><strong>Furniture and large appliances:</strong> Once installed or used</li>
              </ul>
            </div>
          </section>

          <section className="returns-section">
            <h2>How to Return</h2>
            <div className="return-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Initiate Return</h3>
                  <p>Go to "My Orders" in your account and select "Return Item" for the order you want to return.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Select Reason</h3>
                  <p>Choose the reason for return from the dropdown menu and provide any additional details.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Pack the Item</h3>
                  <p>Pack the item securely in its original packaging. Include all accessories, manuals, and tags.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Schedule Pickup</h3>
                  <p>Our delivery partner will pick up the item from your address. You can also drop it at our nearest store.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">5</div>
                <div className="step-content">
                  <h3>Receive Refund</h3>
                  <p>Once we receive and inspect the item, your refund will be processed within 5-7 business days.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="returns-section">
            <h2>Refund Process</h2>
            <div className="refund-info">
              <div className="refund-methods">
                <h3>Refund Methods</h3>
                <ul>
                  <li><strong>Original Payment Method:</strong> Refund to the same card/wallet used for purchase</li>
                  <li><strong>ShopMart Wallet:</strong> Instant credit to your ShopMart wallet for future purchases</li>
                  <li><strong>Bank Transfer:</strong> Direct transfer to your bank account (3-5 business days)</li>
                </ul>
              </div>
              <div className="refund-timeline">
                <h3>Refund Timeline</h3>
                <ul>
                  <li><strong>Item Received:</strong> 1-2 business days after pickup</li>
                  <li><strong>Quality Check:</strong> 1-2 business days</li>
                  <li><strong>Refund Processing:</strong> 1-3 business days</li>
                  <li><strong>Total Time:</strong> 5-7 business days from pickup</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="returns-section">
            <h2>Return Shipping Costs</h2>
            <div className="shipping-costs">
              <div className="cost-info">
                <h3>Free Returns</h3>
                <p>Returns are free for:</p>
                <ul>
                  <li>Wrong item delivered</li>
                  <li>Defective or damaged products</li>
                  <li>Manufacturing defects</li>
                </ul>
              </div>
              <div className="cost-info">
                <h3>Paid Returns</h3>
                <p>Return shipping charges apply for:</p>
                <ul>
                  <li>Size or fit issues (apparel)</li>
                  <li>Change of mind</li>
                  <li>Product not as expected (non-defective)</li>
                </ul>
                <p className="charge">Standard return charge: Rs. 50-100 depending on item size and weight</p>
              </div>
            </div>
          </section>

          <section className="returns-section">
            <h2>Exchange Policy</h2>
            <div className="exchange-info">
              <p>We offer free exchanges for:</p>
              <ul>
                <li>Wrong size or color (same product, different variant)</li>
                <li>Defective items (exchange for same product)</li>
                <li>Manufacturing defects</li>
              </ul>
              <p>Exchange requests must be made within 15 days of delivery.</p>
            </div>
          </section>
        </div>

        <div className="contact-info">
          <h2>Need Help with Returns?</h2>
          <p>Our customer support team is here to assist you with any return-related questions.</p>
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

export default ReturnsPage;
