import React from 'react';
import './FAQPage.css';

const FAQPage = () => {
  const faqs = [
    {
      question: "How do I create an account?",
      answer: "Click on the 'Register' button in the top navigation bar. Fill in your details including name, email, and password. You'll receive a confirmation email to verify your account."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, PayPal, Google Pay, UPI, and Cash on Delivery (COD) for orders below Rs. 5000."
    },
    {
      question: "How long does delivery take?",
      answer: "Standard delivery takes 5-7 business days. Express delivery takes 2-3 business days. Same-day delivery is available in select cities for orders placed before 12 PM."
    },
    {
      question: "Can I cancel or modify my order?",
      answer: "You can cancel or modify your order within 2 hours of placing it. After that, the order enters our fulfillment process and cannot be changed."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for most items. Products must be unused, in original packaging, and with all tags attached. Some items like perishables and personalized products cannot be returned."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and viewing your order history."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we only ship within India. We're working on expanding our international shipping capabilities and will update our customers when available."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach our customer support team via email at support@shopmart.com, phone at +91 98765 43210, or through the live chat feature on our website."
    }
  ];

  return (
    <div className="faq-page">
      <div className="container">
        <div className="faq-header">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about ShopMart</p>
        </div>

        <div className="faq-categories">
          <div className="category-section">
            <h2>Account & Registration</h2>
            <div className="faq-list">
              {faqs.slice(0, 2).map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="category-section">
            <h2>Payment & Orders</h2>
            <div className="faq-list">
              {faqs.slice(2, 5).map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="category-section">
            <h2>Shipping & Support</h2>
            <div className="faq-list">
              {faqs.slice(5).map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="faq-contact">
          <h2>Still have questions?</h2>
          <p>Can't find the answer you're looking for? Our customer support team is here to help.</p>
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

export default FAQPage;
