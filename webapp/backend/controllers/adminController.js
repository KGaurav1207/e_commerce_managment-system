// ============================================================
// Admin Controller - Dashboard, Users, Orders, Inventory
// ============================================================
const db = require('../config/db');

// @desc    Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboardStats = async (req, res) => {
  try {
    const [[userCount]] = await db.query('SELECT COUNT(*) as total FROM Users');
    const [[orderCount]] = await db.query('SELECT COUNT(*) as total FROM Orders');
    const [[productCount]] = await db.query('SELECT COUNT(*) as total FROM Product WHERE is_active = TRUE');
    const [[revenue]] = await db.query("SELECT SUM(total_amount) as total FROM Orders WHERE status != 'cancelled'");
    const [[pendingOrders]] = await db.query("SELECT COUNT(*) as total FROM Orders WHERE status = 'pending'");
    const [recentOrders] = await db.query(
      `SELECT o.order_id, u.name AS customer, o.total_amount, o.status, o.order_date
       FROM Orders o JOIN Users u ON o.user_id = u.user_id
       ORDER BY o.order_date DESC LIMIT 10`
    );
    const [lowStock] = await db.query(
      `SELECT p.name, i.stock_quantity, i.min_stock_alert
       FROM Inventory i JOIN Product p ON i.product_id = p.product_id
       WHERE i.stock_quantity <= i.min_stock_alert ORDER BY i.stock_quantity ASC LIMIT 10`
    );

    res.status(200).json({
      success: true,
      stats: {
        totalUsers: userCount.total,
        totalOrders: orderCount.total,
        totalProducts: productCount.total,
        totalRevenue: revenue.total || 0,
        pendingOrders: pendingOrders.total
      },
      recentOrders,
      lowStock
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT User_ID AS user_id, name, email, phone, NULL AS created_at
       FROM Users ORDER BY User_ID DESC`
    );
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Admin
const getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM Orders o JOIN Users u ON o.user_id = u.user_id
       ORDER BY o.order_date DESC`
    );
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    await db.query('UPDATE Orders SET status = ? WHERE order_id = ?', [status, req.params.id]);
    await db.query('INSERT INTO Tracking (order_id, status, description) VALUES (?, ?, ?)',
      [req.params.id, status.charAt(0).toUpperCase() + status.slice(1), `Order status updated to ${status}.`]
    );

    res.status(200).json({ success: true, message: `Order status updated to ${status}!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get inventory
// @route   GET /api/admin/inventory
// @access  Admin
const getInventory = async (req, res) => {
  try {
    const [inventory] = await db.query(
      `SELECT i.Invent_ID AS inventory_id,
              i.product_ID AS product_id,
              i.stock_quantity,
              10 AS min_stock_alert,
              p.name AS product_name,
              p.price,
              c.name AS category_name
       FROM Inventory i
       JOIN Product p ON i.product_ID = p.Prod_ID
       LEFT JOIN Category c ON p.Cat_ID = c.Cat_ID
       ORDER BY i.stock_quantity ASC`
    );
    res.status(200).json({ success: true, count: inventory.length, inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update inventory
// @route   PUT /api/admin/inventory/:productId
// @access  Admin
const updateInventory = async (req, res) => {
  try {
    const { stock_quantity } = req.body;
    await db.query(
      'UPDATE Inventory SET stock_quantity = ? WHERE product_ID = ?',
      [stock_quantity, req.params.productId]
    );
    res.status(200).json({ success: true, message: 'Inventory updated successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all suppliers
// @route   GET /api/admin/suppliers
// @access  Admin
const getSuppliers = async (req, res) => {
  try {
    const [suppliers] = await db.query('SELECT * FROM Supplier ORDER BY name');
    res.status(200).json({ success: true, suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, getAllUsers, getAllOrders, updateOrderStatus, getInventory, updateInventory, getSuppliers };
