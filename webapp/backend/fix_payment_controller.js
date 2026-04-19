// ============================================================
// Fix Payment Controller with Working Admin Receipt
// ============================================================
const fs = require('fs');

function fixPaymentController() {
  try {
    console.log('=== Fixing Payment Controller ===\n');
    
    // Read the current paymentController.js
    const controllerContent = fs.readFileSync('./controllers/paymentController.js', 'utf8');
    
    // Define the working admin receipt function
    const workingAdminReceipt = `// @desc    Generate receipt for any order (admin only)
// @route   GET /api/payments/admin/receipt/:orderId
// @access  Private (Admin only)
const generateAdminReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order details (no address join since Orders table doesn't have address_id)
    const [orders] = await db.query(
      \`SELECT o.Order_ID AS order_id, 
              o.User_ID AS user_id, 
              o.total_amount, 
              o.order_date AS created_at,
              o.status
       FROM Orders o
       WHERE o.Order_ID = ?\`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // Get order items
    const [items] = await db.query(
      \`SELECT od.Prod_ID AS product_id,
              od.quantity,
              od.price,
              p.name,
              p.image_url,
              p.discount_price
       FROM Order_Detail od
       JOIN Product p ON od.Prod_ID = p.Prod_ID
       WHERE od.order_ID = ?\`,
      [orderId]
    );

    // Get payment information
    const [payments] = await db.query(
      \`SELECT transaction_id, payment_method, payment_date, status 
       FROM Payments 
       WHERE order_id = ? AND status = 'SUCCESS'
       ORDER BY payment_date DESC LIMIT 1\`,
      [orderId]
    );

    // Get user information for shipping address
    const [users] = await db.query(
      \`SELECT u.name, u.email, u.phone
       FROM Users u
       WHERE u.User_ID = ?\`,
      [order.user_id]
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
      discount_amount: 0,
      shipping_address: users[0] ? {
        full_name: users[0].name,
        phone: users[0].phone,
        email: users[0].email,
        city: 'Not specified',
        state: 'Not specified',
        country: 'India'
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
};`;

    // Find the start and end of the existing generateAdminReceipt function
    const startMarker = '// @desc    Generate receipt for any order (admin only)';
    const endMarker = 'module.exports';
    
    const startIndex = controllerContent.indexOf(startMarker);
    const endIndex = controllerContent.indexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
      console.log('Could not find the admin receipt function to replace');
      return;
    }
    
    // Replace the admin receipt function
    const beforeFunction = controllerContent.substring(0, startIndex);
    const afterFunction = controllerContent.substring(endIndex);
    
    const newContent = beforeFunction + workingAdminReceipt + '\n\n' + afterFunction;
    
    // Write the fixed controller
    fs.writeFileSync('./controllers/paymentController.js', newContent);
    
    console.log('Payment Controller fixed successfully!');
    console.log('Admin receipt function replaced with working version');
    
  } catch (error) {
    console.error('Fix failed:', error.message);
  }
}

// Run the fix
fixPaymentController();
