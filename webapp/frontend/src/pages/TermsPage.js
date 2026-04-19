import React from 'react';
import './TermsPage.css';

const TermsPage = () => {
  return (
    <div className="terms-page">
      <div className="container">
        <div className="terms-header">
          <h1>Terms of Service</h1>
          <p>Terms and conditions governing your use of ShopMart services</p>
          <p className="last-updated">Last updated: January 1, 2024</p>
        </div>

        <div className="terms-content">
          <section className="terms-section">
            <h2>Agreement to Terms</h2>
            <div className="agreement-info">
              <p>By accessing and using ShopMart, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
              <p>These terms apply to all users, visitors, customers, and others who access or use the service.</p>
            </div>
          </section>

          <section className="terms-section">
            <h2>Use License</h2>
            <div className="license-info">
              <p>Permission is granted to temporarily download one copy of the materials on ShopMart for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul>
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the site</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </div>
          </section>

          <section className="terms-section">
            <h2>Account Registration</h2>
            <div className="account-info">
              <div className="requirement-item">
                <h3>Account Requirements</h3>
                <ul>
                  <li>You must be at least 18 years old to create an account</li>
                  <li>Provide accurate, complete, and current information</li>
                  <li>Maintain and update your account information</li>
                  <li>Keep your password secure and confidential</li>
                </ul>
              </div>
              <div className="requirement-item">
                <h3>Account Responsibilities</h3>
                <ul>
                  <li>You are responsible for all activities under your account</li>
                  <li>Notify us immediately of unauthorized use</li>
                  <li>You may not share your account credentials</li>
                  <li>We reserve the right to terminate accounts for violations</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2>Products and Services</h2>
            <div className="products-info">
              <div className="product-category">
                <h3>Product Information</h3>
                <p>We strive to be as accurate as possible in the descriptions of products. However, we do not warrant that product descriptions, colors, information, or other content of the products are accurate, complete, reliable, current, or error-free.</p>
              </div>
              <div className="product-category">
                <h3>Pricing</h3>
                <p>Prices for products are subject to change without notice. We reserve the right to modify or discontinue a product at any time. We are not liable to you or to any third-party for any modification, price change, suspension, or discontinuance of a product.</p>
              </div>
              <div className="product-category">
                <h3>Product Availability</h3>
                <p>We cannot guarantee product availability. Products displayed on the site may not be available for immediate purchase. In case of unavailability, we will notify you and provide alternatives.</p>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2>Orders and Payment</h2>
            <div className="orders-info">
              <div className="order-process">
                <h3>Order Process</h3>
                <ul>
                  <li>All orders are subject to product availability</li>
                  <li>We reserve the right to refuse or cancel any order</li>
                  <li>Order confirmation does not guarantee product availability</li>
                  <li>We may require additional verification for certain orders</li>
                </ul>
              </div>
              <div className="payment-process">
                <h3>Payment Terms</h3>
                <ul>
                  <li>Payment must be received before order processing</li>
                  <li>We accept various payment methods as listed during checkout</li>
                  <li>All prices are inclusive of applicable taxes</li>
                  <li>Additional charges may apply for special services</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2>Shipping and Delivery</h2>
            <div className="shipping-info">
              <div className="shipping-terms">
                <h3>Delivery Terms</h3>
                <ul>
                  <li>Delivery estimates are approximate and not guaranteed</li>
                  <li>We are not liable for delays beyond our control</li>
                  <li>Risk of loss passes to you upon delivery</li>
                  <li>Multiple orders may be shipped separately</li>
                </ul>
              </div>
              <div className="shipping-responsibility">
                <h3>Your Responsibilities</h3>
                <ul>
                  <li>Provide accurate delivery address</li>
                  <li>Be available to receive delivery</li>
                  <li>Inspect items upon receipt</li>
                  <li>Report damages within 48 hours</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2>Returns and Refunds</h2>
            <div className="returns-info">
              <p>Our return policy is detailed in the Returns & Refunds section. By placing an order, you agree to these terms. Key points include:</p>
              <ul>
                <li>30-day return window for most items</li>
                <li>Items must be in original condition</li>
                <li>Return shipping may apply in some cases</li>
                <li>Refunds processed within 5-7 business days</li>
              </ul>
            </div>
          </section>

          <section className="terms-section">
            <h2>Intellectual Property</h2>
            <div className="ip-info">
              <div className="ip-category">
                <h3>Our Content</h3>
                <p>All content on ShopMart, including but not limited to text, graphics, logos, images, data compilations, and software, is the property of ShopMart or its content suppliers and protected by international copyright laws.</p>
              </div>
              <div className="ip-category">
                <h3>Your Content</h3>
                <p>By submitting content to ShopMart, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such content for the purpose of operating and promoting the service.</p>
              </div>
              <div className="ip-category">
                <h3>Trademark</h3>
                <p>ShopMart and related graphics are trademarks of ShopMart. Other trademarks appearing on the site are the property of their respective owners.</p>
              </div>
            </div>
          </section>

          <section className="terms-section">
            <h2>User Conduct</h2>
            <div className="conduct-info">
              <p>You agree not to:</p>
              <ul>
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Transmit malicious code or viruses</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Impersonate any person or entity</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Post inappropriate or offensive content</li>
              </ul>
            </div>
          </section>

          <section className="terms-section">
            <h2>Privacy</h2>
            <div className="privacy-info">
              <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.</p>
              <p>By using ShopMart, you consent to the collection and use of information as described in our Privacy Policy.</p>
            </div>
          </section>

          <section className="terms-section">
            <h2>Disclaimer</h2>
            <div className="disclaimer-info">
              <p>The materials on ShopMart are provided on an 'as is' basis. ShopMart makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
              <p>Further, ShopMart does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.</p>
            </div>
          </section>

          <section className="terms-section">
            <h2>Limitation of Liability</h2>
            <div className="liability-info">
              <p>In no event shall ShopMart or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ShopMart, even if ShopMart or an authorized representative has been notified orally or in writing of the possibility of such damage.</p>
              <p>Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.</p>
            </div>
          </section>

          <section className="terms-section">
            <h2>Indemnification</h2>
            <div className="indemnification-info">
              <p>You agree to indemnify and defend ShopMart and its affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).</p>
            </div>
          </section>

          <section className="terms-section">
            <h2>Termination</h2>
            <div className="termination-info">
              <p>We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation.</p>
              <p>Upon termination, your right to use the service will cease immediately. All provisions of the Terms which by their nature should survive termination shall survive.</p>
            </div>
          </section>

          <section className="terms-section">
            <h2>Governing Law</h2>
            <div className="governing-info">
              <p>These terms and any policies or operating rules posted by us on this site or in relation to the service constitute the entire agreement and understanding between you and us.</p>
              <p>These terms are governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
            </div>
          </section>

          <section className="terms-section">
            <h2>Changes to Terms</h2>
            <div className="changes-info">
              <p>We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes.</p>
              <p>Your continued use of or access to our website or the Service following the posting of any changes constitutes acceptance of those changes.</p>
            </div>
          </section>
        </div>

        <div className="contact-info">
          <h2>Questions About Terms?</h2>
          <p>If you have any questions about these Terms of Service, please contact us:</p>
          <div className="contact-options">
            <a href="mailto:legal@shopmart.com" className="contact-btn">
              <i className="fas fa-gavel"></i> Legal Team
            </a>
            <a href="mailto:support@shopmart.com" className="contact-btn">
              <i className="fas fa-headset"></i> Customer Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
