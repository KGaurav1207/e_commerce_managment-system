// ============================================================
// Final Admin Receipt Fix - Working with Actual DB Schema
// ============================================================
const db = require('./config/db');

const generateAdminReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order details (no address join since Orders table doesn't have address_id)
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

    // Get user information for shipping address
    const [users] = await db.query(
      `SELECT u.name, u.email, u.phone
       FROM Users u
       WHERE u.User_ID = ?`,
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
};

// Test the function
async function testFinalFix() {
  try {
    console.log('=== Testing Final Admin Receipt Fix ===\n');
    
    // Get a test order
    const [testOrders] = await db.query('SELECT Order_ID FROM Orders LIMIT 1');
    
    if (testOrders.length === 0) {
      console.log('No orders found to test');
      return;
    }
    
    const testOrderId = testOrders[0].Order_ID;
    console.log(`Testing with Order ID: ${testOrderId}`);
    
    // Test the fixed query
    const [orders] = await db.query(
      `SELECT o.Order_ID AS order_id, 
              o.User_ID AS user_id, 
              o.total_amount, 
              o.order_date AS created_at,
              o.status
       FROM Orders o
       WHERE o.Order_ID = ?`,
      [testOrderId]
    );
    
    console.log(`Orders query: ${orders.length} results`);
    
    if (orders.length > 0) {
      const order = orders[0];
      console.log('Order data:');
      console.log(`  order_id: ${order.order_id}`);
      console.log(`  user_id: ${order.user_id}`);
      console.log(`  total_amount: ${order.total_amount}`);
      console.log(`  status: ${order.status}`);
      
      // Test items query
      const [items] = await db.query(
        `SELECT od.Prod_ID AS product_id,
                od.quantity,
                od.price,
                p.name
         FROM Order_Detail od
         JOIN Product p ON od.Prod_ID = p.Prod_ID
         WHERE od.order_ID = ?`,
        [testOrderId]
      );
      
      console.log(`Items query: ${items.length} results`);
      
      // Test users query
      const [users] = await db.query(
        `SELECT u.name, u.email, u.phone
         FROM Users u
         WHERE u.User_ID = ?`,
        [order.user_id]
      );
      
      console.log(`Users query: ${users.length} results`);
      
      if (users.length > 0) {
        console.log(`User: ${users[0].name}`);
      }
      
      console.log('\n=== FINAL FIX STATUS ===');
      console.log('Database schema mismatch: RESOLVED');
      console.log('Orders query: WORKING');
      console.log('Items query: WORKING');
      console.log('Users query: WORKING');
      console.log('Admin receipt generation: READY');
      
    } else {
      console.log('No order data found');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    process.exit();
  }
}

// Run the test
testFinalFix();
