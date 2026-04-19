// ============================================================
// Wishlist Controller
// ============================================================
const db = require('../config/db');

// @desc    Get wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    let [wishlists] = await db.query('SELECT * FROM Wishlist WHERE user_id = ?', [userId]);
    if (wishlists.length === 0) {
      await db.query('INSERT INTO Wishlist (user_id) VALUES (?)', [userId]);
      [wishlists] = await db.query('SELECT * FROM Wishlist WHERE user_id = ?', [userId]);
    }

    const wishlistId = wishlists[0].wishlist_id;

    const [items] = await db.query(
      `SELECT wi.wishlist_item_id, wi.wishlist_id, wi.product_id, wi.added_at,
              p.name, p.price, NULL AS discount_price, p.image_url,
              NULL AS brand, 0 AS rating
       FROM Wishlist_Item wi
       JOIN Product p ON wi.product_id = p.Prod_ID
       WHERE wi.wishlist_id = ?`,
      [wishlistId]
    );

    res.status(200).json({ success: true, wishlist_id: wishlistId, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    let [wishlists] = await db.query('SELECT * FROM Wishlist WHERE user_id = ?', [userId]);
    if (wishlists.length === 0) {
      await db.query('INSERT INTO Wishlist (user_id) VALUES (?)', [userId]);
      [wishlists] = await db.query('SELECT * FROM Wishlist WHERE user_id = ?', [userId]);
    }
    const wishlistId = wishlists[0].wishlist_id;

    const [existing] = await db.query('SELECT * FROM Wishlist_Item WHERE wishlist_id = ? AND product_id = ?', [wishlistId, product_id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist.' });
    }

    await db.query('INSERT INTO Wishlist_Item (wishlist_id, product_id) VALUES (?, ?)', [wishlistId, product_id]);
    res.status(201).json({ success: true, message: 'Product added to wishlist!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const [wishlists] = await db.query('SELECT * FROM Wishlist WHERE user_id = ?', [userId]);
    if (wishlists.length === 0) return res.status(404).json({ success: false, message: 'Wishlist not found.' });

    await db.query('DELETE FROM Wishlist_Item WHERE wishlist_id = ? AND product_id = ?', [wishlists[0].wishlist_id, productId]);
    res.status(200).json({ success: true, message: 'Product removed from wishlist!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
