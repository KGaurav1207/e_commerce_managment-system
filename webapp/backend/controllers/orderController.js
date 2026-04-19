// ============================================================
// Order Controller - Place Orders, Get History, Tracking
// ============================================================
const db = require('../config/db');

// @desc    Place an order
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const { address_id, payment_method, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order.' });
    }

    // Calculate total
    let totalAmount = 0;
    for (const item of items) {
      const [product] = await connection.query('SELECT price, discount_price FROM Product WHERE product_id = ?', [item.product_id]);
      if (product.length === 0) throw new Error(`Product ${item.product_id} not found.`);
      const price = product[0].discount_price || product[0].price;
      totalAmount += price * item.quantity;
      item.price = price;
    }

    // Create order
    const [orderResult] = await connection.query(
      'INSERT INTO Orders (user_id, address_id, total_amount, status) VALUES (?, ?, ?, ?)',
      [userId, address_id || null, totalAmount, 'pending']
    );
    const orderId = orderResult.insertId;

    // Insert order details and update inventory
    for (const item of items) {
      await connection.query(
        'INSERT INTO Order_Detail (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
      await connection.query(
        'UPDATE Inventory SET stock_quantity = stock_quantity - ? WHERE product_id = ? AND stock_quantity >= ?',
        [item.quantity, item.product_id, item.quantity]
      );
    }

    // Create payment record
    await connection.query(
      'INSERT INTO Payment (order_id, method, amount, status) VALUES (?, ?, ?, ?)',
      [orderId, payment_method || 'cod', totalAmount, payment_method === 'cod' ? 'pending' : 'success']
    );

    // Create shipment record
    const [couriers] = await connection.query('SELECT courier_id FROM Courier LIMIT 1');
    const courierId = couriers.length > 0 ? couriers[0].courier_id : null;
    await connection.query(
      'INSERT INTO Shipment (order_id, courier_id, tracking_number, estimated_delivery) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
      [orderId, courierId, `TRK${Date.now()}`]
    );

    // Add initial tracking
    await connection.query(
      'INSERT INTO Tracking (order_id, status, description) VALUES (?, ?, ?)',
      [orderId, 'Order Placed', 'Your order has been placed successfully.']
    );

    // Clear cart
    const [carts] = await connection.query('SELECT cart_id FROM Cart WHERE user_id = ?', [userId]);
    if (carts.length > 0) {
      await connection.query('DELETE FROM Cart_Item WHERE cart_id = ?', [carts[0].cart_id]);
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order_id: orderId,
      total_amount: totalAmount
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

// @desc    Get user order history
// @route   GET /api/orders
// @access  Private
const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const [orders] = await db.query(
      `SELECT o.*, a.city, a.state, a.country, p.method AS payment_method, p.status AS payment_status
       FROM Orders o
       LEFT JOIN Address a ON o.address_id = a.address_id
       LEFT JOIN Payment p ON o.order_id = p.order_id
       WHERE o.user_id = ? ORDER BY o.order_date DESC`,
      [userId]
    );
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const [orders] = await db.query(
      `SELECT o.*, a.full_name, a.street, a.city, a.state, a.country, a.zip_code,
              p.method AS payment_method, p.status AS payment_status, p.transaction_id,
              s.tracking_number, s.estimated_delivery, c.name AS courier_name
       FROM Orders o
       LEFT JOIN Address a ON o.address_id = a.address_id
       LEFT JOIN Payment p ON o.order_id = p.order_id
       LEFT JOIN Shipment s ON o.order_id = s.order_id
       LEFT JOIN Courier c ON s.courier_id = c.courier_id
       WHERE o.order_id = ? AND o.user_id = ?`,
      [orderId, userId]
    );

    if (orders.length === 0) return res.status(404).json({ success: false, message: 'Order not found.' });

    const [items] = await db.query(
      `SELECT od.*, p.name, p.image_url, p.brand FROM Order_Detail od
       JOIN Product p ON od.product_id = p.product_id
       WHERE od.order_id = ?`,
      [orderId]
    );

    const [tracking] = await db.query('SELECT * FROM Tracking WHERE order_id = ? ORDER BY updated_at DESC', [orderId]);

    res.status(200).json({ success: true, order: orders[0], items, tracking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const [orders] = await db.query('SELECT * FROM Orders WHERE order_id = ? AND user_id = ?', [orderId, userId]);
    if (orders.length === 0) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (!['pending', 'confirmed'].includes(orders[0].status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage.' });
    }

    await db.query('UPDATE Orders SET status = ? WHERE order_id = ?', ['cancelled', orderId]);
    await db.query('INSERT INTO Tracking (order_id, status, description) VALUES (?, ?, ?)', [orderId, 'Cancelled', 'Order has been cancelled.']);

    res.status(200).json({ success: true, message: 'Order cancelled successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { placeOrder, getOrderHistory, getOrderById, cancelOrder };
