import React from 'react';
import './PrivacyPolicyPage.css';

const PrivacyPolicyPage = () => {
  return (
    <div className="privacy-policy-page">
      <div className="container">
        <div className="policy-header">
          <h1>Privacy Policy</h1>
          <p>How we collect, use, and protect your personal information</p>
          <p className="last-updated">Last updated: January 1, 2024</p>
        </div>

        <div className="policy-content">
          <section className="policy-section">
            <h2>Information We Collect</h2>
            <div className="info-categories">
              <div className="info-category">
                <h3>Personal Information</h3>
                <ul>
                  <li>Name, email address, phone number</li>
                  <li>Shipping and billing addresses</li>
                  <li>Payment information (processed securely)</li>
                  <li>Account credentials (encrypted)</li>
                </ul>
              </div>
              <div className="info-category">
                <h3>Usage Information</h3>
                <ul>
                  <li>Browsing history and search queries</li>
                  <li>Products viewed and purchased</li>
                  <li>Shopping cart contents</li>
                  <li>Wishlist items and preferences</li>
                </ul>
              </div>
              <div className="info-category">
                <h3>Technical Information</h3>
                <ul>
                  <li>IP address and device information</li>
                  <li>Browser type and operating system</li>
                  <li>Cookies and tracking data</li>
                  <li>Location data (with consent)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>How We Use Your Information</h2>
            <div className="usage-purposes">
              <div className="purpose-card">
                <div className="icon">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <h3>Service Provision</h3>
                <p>Process orders, deliver products, and provide customer support</p>
              </div>
              <div className="purpose-card">
                <div className="icon">
                  <i className="fas fa-user"></i>
                </div>
                <h3>Personalization</h3>
                <p>Customize your shopping experience and show relevant products</p>
              </div>
              <div className="purpose-card">
                <div className="icon">
                  <i className="fas fa-bullhorn"></i>
                </div>
                <h3>Marketing</h3>
                <p>Send promotional offers and updates (with consent)</p>
              </div>
              <div className="purpose-card">
                <div className="icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h3>Security</h3>
                <p>Prevent fraud and ensure platform security</p>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Information Sharing</h2>
            <div className="sharing-info">
              <div className="sharing-category">
                <h3>We share information with:</h3>
                <ul>
                  <li><strong>Payment Processors:</strong> For secure payment processing</li>
                  <li><strong>Shipping Partners:</strong> To deliver your orders</li>
                  <li><strong>Service Providers:</strong> For cloud hosting, analytics, and customer support</li>
                  <li><strong>Legal Authorities:</strong> When required by law</li>
                </ul>
              </div>
              <div className="sharing-category">
                <h3>We never sell your:</h3>
                <ul>
                  <li>Personal contact information</li>
                  <li>Purchase history</li>
                  <li>Browsing behavior</li>
                  <li>Location data</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Cookies and Tracking</h2>
            <div className="cookies-info">
              <div className="cookie-type">
                <h3>Essential Cookies</h3>
                <p>Required for basic website functionality and security</p>
                <p className="status">Always Active</p>
              </div>
              <div className="cookie-type">
                <h3>Performance Cookies</h3>
                <p>Help us understand how our website is used</p>
                <p className="status">Optional</p>
              </div>
              <div className="cookie-type">
                <h3>Marketing Cookies</h3>
                <p>Used for personalized advertising and promotions</p>
                <p className="status">Optional</p>
              </div>
              <div className="cookie-controls">
                <p>You can control cookies through your browser settings or our cookie preference center.</p>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Data Security</h2>
            <div className="security-measures">
              <div className="security-item">
                <div className="icon">
                  <i className="fas fa-lock"></i>
                </div>
                <h3>Encryption</h3>
                <p>All data is encrypted using SSL/TLS protocols</p>
              </div>
              <div className="security-item">
                <div className="icon">
                  <i className="fas fa-server"></i>
                </div>
                <h3>Secure Servers</h3>
                <p>Data stored in secure, access-controlled servers</p>
              </div>
              <div className="security-item">
                <div className="icon">
                  <i className="fas fa-user-shield"></i>
                </div>
                <h3>Access Control</h3>
                <p>Limited employee access with strict authentication</p>
              </div>
              <div className="security-item">
                <div className="icon">
                  <i className="fas fa-sync"></i>
                </div>
                <h3>Regular Updates</h3>
                <p>Continuous security monitoring and updates</p>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Your Rights</h2>
            <div className="user-rights">
              <div className="right-item">
                <h3>Access</h3>
                <p>Request a copy of your personal data</p>
              </div>
              <div className="right-item">
                <h3>Correction</h3>
                <p>Update or correct inaccurate information</p>
              </div>
              <div className="right-item">
                <h3>Deletion</h3>
                <p>Request deletion of your personal data</p>
              </div>
              <div className="right-item">
                <h3>Portability</h3>
                <p>Transfer your data to another service</p>
              </div>
              <div className="right-item">
                <h3>Objection</h3>
                <p>Opt out of marketing communications</p>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>Data Retention</h2>
            <div className="retention-info">
              <p>We retain your personal information for as long as necessary to:</p>
              <ul>
                <li>Fulfill our legal and contractual obligations</li>
                <li>Provide you with our services</li>
                <li>Comply with applicable laws and regulations</li>
                <li>Resolve disputes and enforce our agreements</li>
              </ul>
              <p>Account data is typically retained for 7 years after account closure for legal compliance.</p>
            </div>
          </section>

          <section className="policy-section">
            <h2>Children's Privacy</h2>
            <div className="children-privacy">
              <p>Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it immediately.</p>
              <p>Parents can contact us at privacy@shopmart.com for any concerns about their child's privacy.</p>
            </div>
          </section>

          <section className="policy-section">
            <h2>International Data Transfers</h2>
            <div className="international-info">
              <p>Your personal information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers, including:</p>
              <ul>
                <li>Standard contractual clauses</li>
                <li>Adequacy decisions by relevant authorities</li>
                <li>Binding corporate rules</li>
              </ul>
            </div>
          </section>

          <section className="policy-section">
            <h2>Changes to This Policy</h2>
            <div className="changes-info">
              <p>We may update this privacy policy from time to time. We will notify you of any changes by:</p>
              <ul>
                <li>Emailing the changes to registered users</li>
                <li>Posting a notice on our website</li>
                <li>Updating the "Last updated" date</li>
              </ul>
              <p>Continued use of our services after changes constitutes acceptance of the updated policy.</p>
            </div>
          </section>
        </div>

        <div className="contact-info">
          <h2>Contact Us About Privacy</h2>
          <p>If you have questions about this privacy policy or want to exercise your rights, please contact us:</p>
          <div className="contact-options">
            <a href="mailto:privacy@shopmart.com" className="contact-btn">
              <i className="fas fa-envelope"></i> Privacy Team
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

export default PrivacyPolicyPage;
