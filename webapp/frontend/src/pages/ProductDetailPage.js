import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { resolveImageUrl, handleImageError } from '../utils/image';
import './ProductDetailPage.css';

const StarRating = ({ rating, size = 16 }) => {
  const num = parseFloat(rating) || 0;
  return (
    <div className="stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map(i => (
        <i key={i} className={`fas fa-star star ${i <= Math.round(num) ? 'filled' : ''}`}></i>
      ))}
      <span style={{ fontSize: 13, color: 'var(--text-light)', marginLeft: 6 }}>{num.toFixed(1)}</span>
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
        setReviews(res.data.reviews || []);
      } catch { toast.error('Product not found'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.warning('Please login to add items to your cart');
      navigate('/login');
      return;
    }
    if (!product || !product.product_id) {
      toast.error('Product information not available');
      return;
    }
    if (qty <= 0) {
      toast.error('Please select a valid quantity');
      return;
    }
    try {
      await addToCart(product.product_id, qty);
      toast.success(`${qty}x ${product.name} added to your cart!`);
    } catch (error) {
      toast.error(error.response?.data?.message || `Could not add ${product.name} to cart`);
    }
  };

  const handleWishlist = async () => {
    if (!user) { toast.warning('Please login to save items to your wishlist'); return; }
    try {
      await api.post('/wishlist', { product_id: product.product_id });
      toast.success(`${product.name} saved to your wishlist!`);
    } catch (err) { toast.error(err.response?.data?.message || 'Could not save to wishlist'); }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.warning('Please login to continue to checkout');
      navigate('/login');
      return;
    }
    if (!product || !product.product_id) {
      toast.error('Product information not available');
      return;
    }
    if (qty <= 0) {
      toast.error('Please select a valid quantity');
      return;
    }
    try {
      await addToCart(product.product_id, qty);
      toast.info(`Taking you to checkout with ${product.name}...`);
      navigate('/checkout');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not proceed to checkout');
    }
  };

  const handleReview = async e => {
    e.preventDefault();
    if (!user) { toast.warning('Please login to write a review'); return; }
    try {
      await api.post('/reviews', { product_id: id, ...reviewForm });
      toast.success('Your review has been submitted. Thank you!');
      const res = await api.get(`/products/${id}`);
      setReviews(res.data.reviews || []);
    } catch (err) { toast.error(err.response?.data?.message || 'Could not submit your review'); }
  };

  if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;
  if (!product) return <div className="container"><div className="alert alert-danger">Product not found</div></div>;

  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null;
  const imgSrc = resolveImageUrl({
    imageUrl: product.image_url,
    name: product.name,
    size: '500x500',
  });

  return (
    <div className="product-detail-page page-container">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <i className="fas fa-chevron-right"></i>
          <Link to="/products">Products</Link> <i className="fas fa-chevron-right"></i>
          <span>{product.name}</span>
        </nav>

        {/* Product Info Section */}
        <div className="product-detail-grid">
          {/* Image */}
          <div className="product-img-section">
            <div className="main-img-wrap">
              <img
                src={imgSrc}
                alt={product.name}
                onError={(e) => handleImageError(e, { name: product.name, size: '500x500' })}
              />
              {discount && <div className="detail-badge">{discount}% OFF</div>}
            </div>
          </div>

          {/* Details */}
          <div className="product-detail-info">
            {product.category_name && (
              <span className="detail-category">{product.category_name}</span>
            )}
            <h1 className="detail-title">{product.name}</h1>
            {product.brand && <p className="detail-brand">by <strong>{product.brand}</strong></p>}

            <div className="detail-rating">
              <StarRating rating={product.rating || 0} size={18} />
              <span className="review-link">({product.total_reviews || 0} reviews)</span>
            </div>

            <div className="detail-price">
              <span className="price-main">₹{(product.discount_price || product.price).toLocaleString('en-IN')}</span>
              {product.discount_price && (
                <>
                  <span className="price-crossed">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="price-save">You save {discount}%!</span>
                </>
              )}
            </div>

            <div className="stock-info">
              {product.stock_quantity > 0 ? (
                <><i className="fas fa-check-circle" style={{ color: 'var(--success)' }}></i>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>In Stock</span>
                  <span className="stock-count">({product.stock_quantity} available)</span></>
              ) : (
                <><i className="fas fa-times-circle" style={{ color: 'var(--danger)' }}></i>
                  <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Out of Stock</span></>
              )}
            </div>

            {/* Quantity */}
            <div className="qty-section">
              <label>Quantity:</label>
              <div className="qty-control">
                <button onClick={() => setQty(Math.max(1, qty - 1))}><i className="fas fa-minus"></i></button>
                <span>{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock_quantity || 10, qty + 1))}><i className="fas fa-plus"></i></button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="cta-btns">
              <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={!product.stock_quantity}>
                <i className="fas fa-shopping-cart"></i> Add to Cart
              </button>
              <button className="btn btn-secondary btn-lg" onClick={handleBuyNow} disabled={!product.stock_quantity}>
                <i className="fas fa-bolt"></i> Buy Now
              </button>
              <button className="btn btn-outline wishlist-cta" onClick={handleWishlist}>
                <i className="fas fa-heart"></i>
              </button>
            </div>

            {/* Highlights */}
            <div className="product-highlights">
              <div><i className="fas fa-shield-alt"></i><span>1 Year Warranty</span></div>
              <div><i className="fas fa-truck"></i><span>Free Delivery above ₹499</span></div>
              <div><i className="fas fa-undo"></i><span>10-Day Return Policy</span></div>
              <div><i className="fas fa-certificate"></i><span>100% Authentic</span></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-tabs">
          <div className="tabs-header">
            {['description', 'reviews', 'specifications'].map(t => (
              <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {t === 'reviews' && ` (${reviews.length})`}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-tab">
                <p>{product.description || 'No description available.'}</p>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="reviews-tab">
                {reviews.map(r => (
                  <div className="review-item" key={r.Rev_ID}>
                    <div className="review-header">
                      <div className="reviewer-avatar">{r.user_name?.[0]?.toUpperCase()}</div>
                      <div>
                        <strong>{r.user_name}</strong>
                        <StarRating rating={r.rating} size={13} />
                      </div>
                      <span className="review-date">{new Date(r.rev_date).toLocaleDateString()}</span>
                    </div>
                    <p className="review-comment">{r.comment}</p>
                  </div>
                ))}
                {reviews.length === 0 && <p className="no-reviews">No reviews yet. Be the first to review!</p>}

                {user && (
                  <form className="review-form" onSubmit={handleReview}>
                    <h4>Write a Review</h4>
                    <div className="form-group">
                      <label className="form-label">Rating</label>
                      <div className="rating-picker">
                        {[1,2,3,4,5].map(s => (
                          <button type="button" key={s}
                            className={`star-pick ${s <= reviewForm.rating ? 'selected' : ''}`}
                            onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                            <i className="fas fa-star"></i>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Comment</label>
                      <textarea className="form-control" rows="4" placeholder="Share your experience..."
                        value={reviewForm.comment}
                        onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">Submit Review</button>
                  </form>
                )}
              </div>
            )}
            {activeTab === 'specifications' && (
              <div className="specs-tab">
                <table className="spec-table">
                  <tbody>
                    <tr><td>Brand</td><td>{product.brand || '—'}</td></tr>
                    <tr><td>Category</td><td>{product.category_name || '—'}</td></tr>
                    <tr><td>Supplier</td><td>{product.supplier_name || '—'}</td></tr>
                    <tr><td>Stock</td><td>{product.stock_quantity} units</td></tr>
                    <tr><td>Listed On</td><td>{new Date(product.created_at).toLocaleDateString()}</td></tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
