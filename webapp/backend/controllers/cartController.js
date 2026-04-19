// ============================================================
// Cart Controller - Add, Remove, Update, Get Cart Items
// ============================================================
const db = require('../config/db');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create cart
    let [carts] = await db.query('SELECT * FROM Cart WHERE User_ID = ?', [userId]);
    if (carts.length === 0) {
      await db.query('INSERT INTO Cart (User_ID) VALUES (?)', [userId]);
      [carts] = await db.query('SELECT * FROM Cart WHERE User_ID = ?', [userId]);
    }

    const cartId = carts[0].Cart_ID;

    const [items] = await db.query(
      `SELECT ci.Cart_ID,
              ci.Prod_ID AS product_id,
              ci.quantity,
              p.name,
              p.price,
              p.image_url,
              i.stock_quantity
       FROM Cart_Item ci
       JOIN Product p ON ci.Prod_ID = p.Prod_ID
       LEFT JOIN Inventory i ON p.Prod_ID = i.product_ID
       WHERE ci.Cart_ID = ?`,
      [cartId]
    );

    const totalAmount = items.reduce((sum, item) => {
      const price = item.price;
      return sum + (price * item.quantity);
    }, 0);

    res.status(200).json({ success: true, cart_id: cartId, items, totalAmount: totalAmount.toFixed(2) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) return res.status(400).json({ success: false, message: 'Product ID is required.' });

    // Get cart
    let [carts] = await db.query('SELECT * FROM Cart WHERE User_ID = ?', [userId]);
    if (carts.length === 0) {
      await db.query('INSERT INTO Cart (User_ID) VALUES (?)', [userId]);
      [carts] = await db.query('SELECT * FROM Cart WHERE User_ID = ?', [userId]);
    }
    const cartId = carts[0].Cart_ID;

    // Check if product already in cart
    const [existingItem] = await db.query(
      'SELECT * FROM Cart_Item WHERE Cart_ID = ? AND Prod_ID = ?',
      [cartId, product_id]
    );

    if (existingItem.length > 0) {
      // Update quantity
      await db.query(
        'UPDATE Cart_Item SET quantity = quantity + ? WHERE Cart_ID = ? AND Prod_ID = ?',
        [quantity, cartId, product_id]
      );
      return res.status(200).json({ success: true, message: 'Cart updated successfully!' });
    } else {
      await db.query('INSERT INTO Cart_Item (Cart_ID, Prod_ID, quantity) VALUES (?, ?, ?)', [cartId, product_id, quantity]);
      return res.status(201).json({ success: true, message: 'Item added to cart!' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quantity } = req.body;
    const productId = req.params.productId;

    const [carts] = await db.query('SELECT * FROM Cart WHERE User_ID = ?', [userId]);
    if (carts.length === 0) return res.status(404).json({ success: false, message: 'Cart not found.' });

    if (quantity <= 0) {
      await db.query('DELETE FROM Cart_Item WHERE Cart_ID = ? AND Prod_ID = ?', [carts[0].Cart_ID, productId]);
      return res.status(200).json({ success: true, message: 'Item removed from cart.' });
    }

    await db.query('UPDATE Cart_Item SET quantity = ? WHERE Cart_ID = ? AND Prod_ID = ?', [quantity, carts[0].Cart_ID, productId]);
    res.status(200).json({ success: true, message: 'Cart updated!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const [carts] = await db.query('SELECT * FROM Cart WHERE User_ID = ?', [userId]);
    if (carts.length === 0) return res.status(404).json({ success: false, message: 'Cart not found.' });

    await db.query('DELETE FROM Cart_Item WHERE Cart_ID = ? AND Prod_ID = ?', [carts[0].Cart_ID, productId]);
    res.status(200).json({ success: true, message: 'Item removed from cart!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
