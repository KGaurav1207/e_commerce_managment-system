import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { resolveImageUrl, handleImageError } from '../utils/image';
import './ProductCard.css';

const StarRating = ({ rating }) => {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <i key={i} className={`fas fa-star star ${i <= Math.round(rating) ? 'filled' : ''}`}></i>
      ))}
      <span className="rating-val">{rating?.toFixed(1) || '0.0'}</span>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { toast.warning('Please login to add to cart'); return; }
    try {
      await addToCart(product.product_id, 1);
      toast.success('Added to cart!');
    } catch { toast.error('Failed to add to cart'); }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.warning('Please login to save wishlist'); return; }
    try {
      await api.post('/wishlist', { product_id: product.product_id });
      toast.success('Added to wishlist!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to wishlist');
    }
  };

  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : null;

  const imgSrc = resolveImageUrl({
    imageUrl: product.image_url,
    name: product.name,
    size: '300x300',
  });

  return (
    <Link to={`/products/${product.product_id}`} className="product-card">
      <div className="product-img-wrap">
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          onError={(e) => handleImageError(e, { name: product.name, size: '300x300' })}
        />
        {discount && <span className="discount-badge">{discount}% OFF</span>}
        <div className="card-actions">
          <button className="action-btn wishlist-btn" onClick={handleAddToWishlist} title="Add to Wishlist">
            <i className="fas fa-heart"></i>
          </button>
        </div>
      </div>
      <div className="product-info">
        {product.brand && <span className="product-brand">{product.brand}</span>}
        <h3 className="product-name">{product.name}</h3>
        <StarRating rating={product.rating} />
        {product.total_reviews > 0 && (
          <span className="review-count">({product.total_reviews} reviews)</span>
        )}
        <div className="price-box">
          <span className="price-current">
            ₹{(product.discount_price || product.price).toLocaleString('en-IN')}
          </span>
          {product.discount_price && (
            <>
              <span className="price-original">₹{product.price.toLocaleString('en-IN')}</span>
              <span className="price-discount">{discount}% off</span>
            </>
          )}
        </div>
        {product.stock_quantity === 0 ? (
          <span className="out-of-stock">Out of Stock</span>
        ) : (
          <button className="btn btn-primary btn-full add-cart-btn" onClick={handleAddToCart}>
            <i className="fas fa-shopping-cart"></i> Add to Cart
          </button>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
