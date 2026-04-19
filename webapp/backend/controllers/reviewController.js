// ============================================================
// Review Controller
// ============================================================
const db = require('../config/db');

// @desc    Add a product review
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, rating, comment } = req.body;

    if (!product_id || !rating) {
      return res.status(400).json({ success: false, message: 'Product ID and rating are required.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    // Check if user already reviewed this product
    const [existing] = await db.query('SELECT review_id FROM Review WHERE user_id = ? AND product_id = ?', [userId, product_id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });
    }

    await db.query(
      'INSERT INTO Review (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
      [userId, product_id, rating, comment || null]
    );

    // Update product average rating
    const [ratingResult] = await db.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM Review WHERE product_id = ?',
      [product_id]
    );
    await db.query(
      'UPDATE Product SET rating = ?, total_reviews = ? WHERE product_id = ?',
      [ratingResult[0].avg_rating.toFixed(2), ratingResult[0].total, product_id]
    );

    res.status(201).json({ success: true, message: 'Review added successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get product reviews
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const [reviews] = await db.query(
      `SELECT r.*, u.name AS user_name FROM Review r
       LEFT JOIN Users u ON r.user_id = u.user_id
       WHERE r.product_id = ? ORDER BY r.review_date DESC`,
      [req.params.productId]
    );
    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addReview, getProductReviews };
