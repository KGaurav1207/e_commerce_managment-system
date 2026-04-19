import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { resolveImageUrl, handleImageError } from '../utils/image';
import './WishlistPage.css';

const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setItems(res.data.items || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const removeFromWishlist = async (productId, productName) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setItems(items.filter(i => i.product_id !== productId));
      toast.success(`${productName} removed from your wishlist`);
    } catch { toast.error('Could not remove item from wishlist'); }
  };

  const moveToCart = async (productId, productName) => {
    try {
      await addToCart(productId, 1);
      await api.delete(`/wishlist/${productId}`);
      setItems(items.filter(i => i.product_id !== productId));
      toast.success(`${productName} moved to your cart!`);
    } catch { toast.error('Could not move item to cart'); }
  };

  if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;

  return (
    <div className="wishlist-page page-container">
      <div className="container">
        <div className="wishlist-header">
          <h1 className="section-title">My Wishlist <span>({items.length} items)</span></h1>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><i className="fas fa-heart"></i></div>
            <h3>Your wishlist is empty</h3>
            <p>Save products you love and come back to them anytime</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              <i className="fas fa-shopping-bag"></i> Discover Products
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map(item => {
              const price = item.discount_price || item.price;
              const discount = item.discount_price
                ? Math.round(((item.price - item.discount_price) / item.price) * 100)
                : null;
              const imgSrc = resolveImageUrl({
                imageUrl: item.image_url,
                name: item.name,
                size: '200x200',
              });

              return (
                <div className="wishlist-item card" key={item.wishlist_item_id}>
                  <div className="wishlist-img-wrap">
                    <Link to={`/products/${item.product_id}`}>
                      <img
                        src={imgSrc}
                        alt={item.name}
                        onError={(e) => handleImageError(e, { name: item.name, size: '200x200' })}
                      />
                    </Link>
                    {discount && <span className="discount-badge">{discount}% OFF</span>}
                    <button className="remove-wish-btn" onClick={() => removeFromWishlist(item.product_id, item.name)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="wishlist-item-info">
                    {item.brand && <span className="product-brand">{item.brand}</span>}
                    <Link to={`/products/${item.product_id}`}>
                      <h3>{item.name}</h3>
                    </Link>
                    <div className="price-box">
                      <span className="price-current">₹{price.toLocaleString('en-IN')}</span>
                      {item.discount_price && <span className="price-original">₹{item.price.toLocaleString('en-IN')}</span>}
                    </div>
                    <div className="wish-stars">
                      {[1,2,3,4,5].map(s => (
                        <i key={s} className={`fas fa-star star ${s <= Math.round(item.rating) ? 'filled' : ''}`}></i>
                      ))}
                    </div>
                    <div className="wish-actions">
                      <button className="btn btn-primary btn-full btn-sm" onClick={() => moveToCart(item.product_id, item.name)}>
                        <i className="fas fa-shopping-cart"></i> Move to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
