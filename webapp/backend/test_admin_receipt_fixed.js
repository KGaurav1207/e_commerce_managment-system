// ============================================================
// Test Admin Receipt After Fix
// ============================================================
const db = require('./config/db');

async function testAdminReceiptFixed() {
  try {
    console.log('=== Testing Admin Receipt After Fix ===\n');
    
    // Test the fixed query
    console.log('1. Testing Fixed Admin Receipt Query...');
    
    const [orders] = await db.query('SELECT Order_ID FROM Orders LIMIT 1');
    
    if (orders.length === 0) {
      console.log('   No orders found to test');
      return;
    }
    
    const testOrderId = orders[0].Order_ID;
    console.log(`   Testing with Order ID: ${testOrderId}`);
    
    try {
      const [orderResults] = await db.query(
        `SELECT o.Order_ID AS order_id, 
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
         LEFT JOIN Address a ON o.address_id = a.address_id
         WHERE o.Order_ID = ?`,
        [testOrderId]
      );
      
      console.log(`   Query result: ${orderResults.length} orders found`);
      
      if (orderResults.length > 0) {
        const order = orderResults[0];
        console.log('   Order data retrieved successfully:');
        console.log(`     order_id: ${order.order_id}`);
        console.log(`     user_id: ${order.user_id}`);
        console.log(`     total_amount: ${order.total_amount}`);
        console.log(`     payment_method: ${order.payment_method}`);
        console.log(`     status: ${order.status}`);
        console.log(`     shipping_address: ${order.full_name ? 'Available' : 'Not available'}`);
        
        // Test order items
        console.log('\n2. Testing Order Items...');
        
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
          [testOrderId]
        );
        
        console.log(`   Items found: ${items.length}`);
        
        if (items.length > 0) {
          items.forEach((item, index) => {
            console.log(`     Item ${index + 1}: ${item.name} (${item.quantity} x ${item.price})`);
          });
        }
        
        // Test payments
        console.log('\n3. Testing Payments...');
        
        const [payments] = await db.query(
          `SELECT transaction_id, payment_method, payment_date, status 
           FROM Payments 
           WHERE order_id = ? AND status = 'SUCCESS'
           ORDER BY payment_date DESC LIMIT 1`,
          [testOrderId]
        );
        
        console.log(`   Payments found: ${payments.length}`);
        
        if (payments.length > 0) {
          const payment = payments[0];
          console.log(`     Payment: ${payment.transaction_id} - ${payment.status}`);
        } else {
          console.log('   No successful payments found (this is normal for test orders)');
        }
        
        // Simulate the complete receipt data structure
        console.log('\n4. Simulating Complete Receipt Data...');
        
        const shippingCost = parseFloat(order.total_amount) > 499 ? 0 : 49;
        const subtotal = parseFloat(order.total_amount) - shippingCost;
        
        const receiptData = {
          order_id: order.order_id,
          created_at: order.created_at,
          total_amount: order.total_amount,
          payment_method: order.payment_method,
          status: order.status,
          shipping_cost: shippingCost,
          discount_amount: 0,
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
            discount_price: item.discount_price,
            image_url: item.image_url
          })),
          payment: payments[0] || null
        };
        
        console.log('   Receipt data structure created successfully');
        console.log(`   Total items: ${receiptData.items.length}`);
        console.log(`   Subtotal: ${subtotal}`);
        console.log(`   Shipping: ${shippingCost}`);
        console.log(`   Total: ${receiptData.total_amount}`);
        
        console.log('\n=== Admin Receipt Fix Status ===');
        console.log('Table name issue: FIXED (User_Address -> Address)');
        console.log('Query execution: WORKING');
        console.log('Data retrieval: WORKING');
        console.log('Receipt structure: COMPLETE');
        
        console.log('\nAdmin receipt generation should now work!');
        
      } else {
        console.log('   No order data found - order may not exist');
      }
      
    } catch (queryError) {
      console.log('   Query error:', queryError.message);
      console.log('   The fix may not have resolved the issue');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    process.exit();
  }
}

// Run the test
testAdminReceiptFixed();
