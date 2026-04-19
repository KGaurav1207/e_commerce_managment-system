// ============================================================
// Fixed Admin Receipt Function
// ============================================================

const generateAdminReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order details with items and shipping address (no user filter for admin)
    const [orders] = await db.query(
      `SELECT o.Order_ID AS order_id, 
              o.User_ID AS user_id, 
              o.total_amount, 
              o.order_date AS created_at,
              o.status,
              a.city,
              a.state,
              a.country
       FROM Orders o
       LEFT JOIN Address a ON o.address_id = a.Address_ID
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
              p.image_url,
              p.discount_price
       FROM Order_Detail od
       JOIN Product p ON od.Prod_ID = p.Prod_ID
       WHERE od.order_ID = ?`,
      [orderId]
    );

    // Get payment information
    const [payments] = await db.query(
      `SELECT transaction_id, payment_method, payment_date, status 
       FROM Payments 
       WHERE order_id = ? AND status = 'SUCCESS'
       ORDER BY payment_date DESC LIMIT 1`,
      [orderId]
    );

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
      discount_amount: 0, // Can be calculated based on promotions
      shipping_address: order.city ? {
        city: order.city,
        state: order.state,
        country: order.country || 'India'
      } : null,
      items: items.map(item => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        discount_price: item.discount_price,
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

console.log('Fixed admin receipt function created successfully');
