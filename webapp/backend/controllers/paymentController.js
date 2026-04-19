// ============================================================
// Payment Controller - Process Payments, Generate Receipts
// ============================================================
const db = require('../config/db');
const crypto = require('crypto');

// @desc    Process payment for an order
// @route   POST /api/payments/process
// @access  Private
const processPayment = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const { orderId, amount, paymentMethod, transactionDetails } = req.body;

    // Validate order exists and belongs to user
    const [orders] = await connection.query(
      `SELECT Order_ID AS Order_ID, total_amount FROM Orders WHERE Order_ID = ? AND User_ID = ?`,
      [orderId, userId]
    );

    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];
    
    // Verify amount matches order total
    if (Math.abs(parseFloat(amount) - parseFloat(order.total_amount)) > 0.01) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Payment amount does not match order total.' });
    }

    // Generate transaction ID
    const transactionId = 'TXN' + Date.now() + crypto.randomBytes(4).toString('hex').toUpperCase();

    // Simulate payment processing (dummy payment gateway)
    const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo

    if (paymentSuccess) {
      // Insert payment record
      const [paymentResult] = await connection.query(
        `INSERT INTO Payment (Order_ID, method, amount, Pay_ID, pay_date) 
         VALUES (?, ?, ?, 'SUCCESS', ?, NOW())`,
        [orderId, paymentMethod, amount, transactionId]
      );

      // Update order status to paid
      await connection.query(
        `UPDATE Orders SET status = 'PAID', payment_method = ?, updated_at = NOW() WHERE Order_ID = ?`,
        [paymentMethod, orderId]
      );

      await connection.commit();

      res.status(200).json({
        success: true,
        message: 'Payment processed successfully!',
        transactionId,
        orderId,
        amount,
        paymentMethod,
        status: 'SUCCESS',
        timestamp: new Date().toISOString()
      });
    } else {
      // Simulate payment failure
      await connection.rollback();
      res.status(400).json({
        success: false,
        message: 'Payment failed. Please try again.',
        transactionId,
        status: 'FAILED'
      });
    }
  } catch (error) {
    await connection.rollback();
    console.error('Payment processing error:', error);
    res.status(500).json({ success: false, message: 'Payment processing failed.' });
  } finally {
    connection.release();
  }
};

// @desc    Get payment status
// @route   GET /api/payments/status/:transactionId
// @access  Private
const getPaymentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { transactionId } = req.params;

    const [payments] = await db.query(
      `SELECT p.*, o.Order_ID as Order_ID, o.User_ID as user_id
       FROM Payment p 
       JOIN Orders o ON p.Order_ID = o.Order_ID 
       WHERE p.Pay_ID = ? AND o.User_ID = ?`,
      [transactionId, userId]
    );

    if (payments.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    const payment = payments[0];
    res.status(200).json({
      success: true,
      transactionId: payment.Pay_ID,
      orderId: payment.Order_ID,
      amount: payment.amount,
      paymentMethod: payment.method,
      status: payment.status,
      paymentDate: payment.pay_date
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve payment status.' });
  }
};

// @desc    Generate receipt for an order
// @route   GET /api/payments/receipt/:orderId
// @access  Private
const generateReceipt = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    // Get order details with items and shipping address
    const [orders] = await db.query(
      `SELECT o.Order_ID AS Order_ID, 
              o.User_ID AS user_id, 
              o.total_amount, 
              o.order_date AS created_at,
              o.status,
              o.payment_method,
              a.full_name,
              a.phone,
              a.street,
              a.city,
              a.state,
              a.zip_code,
              a.country
       FROM Orders o
       LEFT JOIN User_Address a ON o.address_id = a.Address_ID
       WHERE o.Order_ID = ? AND o.User_ID = ?`,
      [orderId, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // Get order items
    const [items] = await db.query(
      `SELECT od.Prod_ID AS product_id,
              od.quantity,
              od.price,
              p.name,
              p.image_url,
       FROM Order_Detail od
       JOIN Product p ON od.Prod_ID = p.Prod_ID
       WHERE od.order_ID = ?`,
      [orderId]
    );

    // Get payment information
    const [payments] = await db.query(
      `SELECT Pay_ID, method as payment_method, pay_date as payment_date 
       FROM Payment 
       WHERE Order_ID = ? 
       ORDER BY pay_date DESC LIMIT 1`,
      [orderId]
    );

    // Calculate shipping cost (dummy logic)
    const shippingCost = parseFloat(order.total_amount) > 499 ? 0 : 49;
    const subtotal = parseFloat(order.total_amount) - shippingCost;

    // Format receipt data
    const receiptData = {
      Order_ID: order.Order_ID,
      created_at: order.created_at,
      total_amount: order.total_amount,
      payment_method: payments[0]?.payment_method || 'Not specified',
      status: order.status,
      shipping_cost: shippingCost,
      discount_amount: 0, // Can be calculated based on promotions
      shipping_address: order.full_name ? {
        full_name: order.full_name,
        phone: order.phone,
        street: order.street,
        city: order.city,
        state: order.state,
        zip_code: order.zip_code,
        country: order.country || 'India'
      } : null,
      items: items.map(item => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image_url: item.image_url
      })),
      payment: payments[0] || null
    };

    res.status(200).json({
      success: true,
      receipt: receiptData
    });
  } catch (error) {
    console.error('Receipt generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate receipt.' });
  }
};

// @desc    Generate receipt for any order (admin only)
// @route   GET /api/payments/admin/receipt/:orderId
// @access  Private (Admin only)
const generateAdminReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order details  
    const [orders] = await db.query(
      `SELECT o.Order_ID AS order_id, 
              o.User_ID AS user_id, 
              o.total_amount, 
              o.order_date AS created_at,
              o.status
       FROM Orders o
       WHERE o.Order_ID = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // Get order items
    const [items] = await db.query(
      `SELECT od.Prod_ID AS product_id,
              od.quantity,
              od.price,
              p.name,
              p.image_url
       FROM Order_Detail od
       JOIN Product p ON od.Prod_ID = p.Prod_ID
       WHERE od.order_ID = ?`,
      [orderId]
    );

    // Get payment information
    const [payments] = await db.query(
      `SELECT Pay_ID, method as payment_method, pay_date as payment_date 
       FROM Payment 
       WHERE Order_ID = ? 
       ORDER BY pay_date DESC LIMIT 1`,
      [orderId]
    );

    // Always get user information for complete details
    const [users] = await db.query(
      `SELECT u.name, u.email, u.phone
       FROM Users u
       WHERE u.User_ID = ?`,
      [order.user_id]
    );
    const userInfo = users[0];

    // Calculate shipping cost (dummy logic)
    const shippingCost = parseFloat(order.total_amount) > 499 ? 0 : 49;
    const subtotal = parseFloat(order.total_amount) - shippingCost;

    // Format receipt data
    const receiptData = {
      order_id: order.order_id,
      created_at: order.created_at,
      total_amount: order.total_amount,
      payment_method: payments[0]?.payment_method || 'Not specified',
      status: order.status,
      shipping_cost: shippingCost,
      discount_amount: 0,
      shipping_address: userInfo ? {
        full_name: userInfo.name,
        phone: userInfo.phone,
        email: userInfo.email,
        street: 'Not specified',
        city: 'Not specified',
        state: 'Not specified',
        zip_code: 'Not specified',
        country: 'India'
      } : null,
      items: items.map(item => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image_url: item.image_url
      })),
      payment: payments[0] || null
    };

    res.status(200).json({
      success: true,
      receipt: receiptData
    });
  } catch (error) {
    console.error('Admin receipt generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate receipt.' });
  }
};

module.exports = { processPayment, getPaymentStatus, generateReceipt, generateAdminReceipt };
