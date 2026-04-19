// ============================================================
// Wishlist Controller
// ============================================================
const db = require('../config/db');
const {
  ensureWishlistSchema,
  getColumns,
  getExistingColumn
} = require('../utils/schemaCompat');

const getWishlistContext = async (userId) => {
  await ensureWishlistSchema();

  const wishlistColumns = await getColumns('Wishlist');
  const wishlistItemColumns = await getColumns('Wishlist_Item');
  const productColumns = await getColumns('Product');
  const wishlistIdColumn = getExistingColumn(wishlistColumns, ['wishlist_id', 'Wishlist_ID']);
  const wishlistUserColumn = getExistingColumn(wishlistColumns, ['user_id', 'User_ID']);
  const wishlistItemIdColumn = getExistingColumn(wishlistItemColumns, ['wishlist_item_id', 'Wishlist_Item_ID']);
  const wishlistItemWishlistColumn = getExistingColumn(wishlistItemColumns, ['wishlist_id', 'Wishlist_ID']);
  const wishlistItemProductColumn = getExistingColumn(wishlistItemColumns, ['product_id', 'Product_ID', 'Prod_ID']);
  const productIdColumn = getExistingColumn(productColumns, ['product_id', 'Prod_ID', 'prod_ID']);

  let [wishlists] = await db.query(
    `SELECT ${wishlistIdColumn} AS wishlist_id FROM Wishlist WHERE ${wishlistUserColumn} = ?`,
    [userId]
  );
  if (wishlists.length === 0) {
    await db.query(`INSERT INTO Wishlist (${wishlistUserColumn}) VALUES (?)`, [userId]);
    [wishlists] = await db.query(
      `SELECT ${wishlistIdColumn} AS wishlist_id FROM Wishlist WHERE ${wishlistUserColumn} = ?`,
      [userId]
    );
  }

  return {
    wishlistId: wishlists[0].wishlist_id,
    wishlistItemIdColumn,
    wishlistItemWishlistColumn,
    wishlistItemProductColumn,
    productIdColumn
  };
};

// @desc    Get wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      wishlistId,
      wishlistItemIdColumn,
      wishlistItemWishlistColumn,
      wishlistItemProductColumn,
      productIdColumn
    } = await getWishlistContext(userId);

    const [items] = await db.query(
      `SELECT wi.${wishlistItemIdColumn} AS wishlist_item_id,
              wi.${wishlistItemWishlistColumn} AS wishlist_id,
              wi.${wishlistItemProductColumn} AS product_id,
              wi.added_at,
              p.name, p.price, NULL AS discount_price, p.image_url,
              NULL AS brand, 0 AS rating
       FROM Wishlist_Item wi
       JOIN Product p ON wi.${wishlistItemProductColumn} = p.${productIdColumn}
       WHERE wi.${wishlistItemWishlistColumn} = ?`,
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
    const { wishlistId, wishlistItemWishlistColumn, wishlistItemProductColumn } = await getWishlistContext(userId);

    const [existing] = await db.query(
      `SELECT * FROM Wishlist_Item WHERE ${wishlistItemWishlistColumn} = ? AND ${wishlistItemProductColumn} = ?`,
      [wishlistId, product_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist.' });
    }

    await db.query(
      `INSERT INTO Wishlist_Item (${wishlistItemWishlistColumn}, ${wishlistItemProductColumn}) VALUES (?, ?)`,
      [wishlistId, product_id]
    );
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
    const { wishlistId, wishlistItemWishlistColumn, wishlistItemProductColumn } = await getWishlistContext(userId);
    await db.query(
      `DELETE FROM Wishlist_Item WHERE ${wishlistItemWishlistColumn} = ? AND ${wishlistItemProductColumn} = ?`,
      [wishlistId, productId]
    );
    res.status(200).json({ success: true, message: 'Product removed from wishlist!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
