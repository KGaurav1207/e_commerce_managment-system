// ============================================================
// Test Real Admin Receipt with Actual Database
// ============================================================
const db = require('./config/db');

async function testRealAdminReceipt() {
  try {
    console.log('=== Testing Real Admin Receipt Functionality ===\n');
    
    // Step 1: Get a real order from database
    console.log('1. Getting Real Order from Database...');
    
    const [orders] = await db.query('SELECT order_id, user_id, total_amount, status FROM Orders LIMIT 1');
    
    if (orders.length === 0) {
      console.log('   No orders found in database');
      return;
    }
    
    const testOrder = orders[0];
    console.log(`   Found Order ${testOrder.order_id}: User ${testOrder.user_id}, Amount ${testOrder.total_amount}, Status ${testOrder.status}`);
    
    // Step 2: Test the exact admin receipt query
    console.log('\n2. Testing Admin Receipt Query...');
    
    try {
      const [orderDetails] = await db.query(
        `SELECT o.Order_ID AS order_id, 
                o.User_ID AS user_id, 
                o.total_amount, 
                o.order_date AS created_at,
                o.status
         FROM Orders o
         WHERE o.Order_ID = ?`,
        [testOrder.order_id]
      );
      
      console.log(`   Order query result: ${orderDetails.length} orders found`);
      
      if (orderDetails.length > 0) {
        const order = orderDetails[0];
        console.log('   Order details:');
        console.log(`     order_id: ${order.order_id}`);
        console.log(`     user_id: ${order.user_id}`);
        console.log(`     total_amount: ${order.total_amount}`);
        console.log(`     created_at: ${order.created_at}`);
        console.log(`     status: ${order.status}`);
        console.log(`     has_address: ${order.full_name ? 'Yes' : 'No'}`);
        
        // Step 3: Test order items query
        console.log('\n3. Testing Order Items Query...');
        
        const [items] = await db.query(
          `SELECT od.Prod_ID AS product_id,
                  od.quantity,
                  od.price,
                  p.name,
                  p.image_url
           FROM Order_Detail od
           JOIN Product p ON od.Prod_ID = p.Prod_ID
           WHERE od.order_ID = ?`,
          [testOrder.order_id]
        );
        
        console.log(`   Items found: ${items.length}`);
        
        items.forEach((item, index) => {
          console.log(`     Item ${index + 1}: ${item.name} (${item.quantity} x ${item.price})`);
        });
        
        // Step 4: Test payment query
        console.log('\n4. Testing Payment Query...');
        
        const [payments] = await db.query(
          `SELECT Pay_ID, method as payment_method, pay_date as payment_date 
           FROM Payment 
           WHERE Order_ID = ?
           ORDER BY pay_date DESC LIMIT 1`,
          [testOrder.order_id]
        );
        
        console.log(`   Payments found: ${payments.length}`);
        
        if (payments.length > 0) {
          const payment = payments[0];
          console.log(`     Payment: ${payment.Pay_ID} - ${payment.payment_method}`);
        } else {
          console.log('   No successful payments found (this might be normal for pending orders)');
        }
        
        // Step 5: Test user info fallback (if no address)
        if (!order.full_name) {
          console.log('\n5. Testing User Info Fallback...');
          
          const [users] = await db.query(
            `SELECT u.name, u.email, u.phone
             FROM Users u
             WHERE u.user_id = ?`,
            [order.user_id]
          );
          
          console.log(`   User info found: ${users.length}`);
          
          if (users.length > 0) {
            const user = users[0];
            console.log(`     User: ${user.name} - ${user.email}`);
          }
        }
        
        // Step 6: Simulate complete admin receipt generation
        console.log('\n6. Simulating Complete Admin Receipt...');
        
        const shippingCost = parseFloat(order.total_amount) > 499 ? 0 : 49;
        const subtotal = parseFloat(order.total_amount) - shippingCost;
        
        let shippingAddress = null;
        if (order.full_name) {
          shippingAddress = {
            full_name: order.full_name,
            phone: order.phone,
            street: order.street,
            city: order.city,
            state: order.state,
            zip_code: order.zip_code,
            country: order.country || 'India'
          };
        } else {
          // Fallback to user info
          const [users] = await db.query(
            `SELECT u.name, u.email, u.phone
             FROM Users u
             WHERE u.user_id = ?`,
            [order.user_id]
          );
          
          if (users.length > 0) {
            const user = users[0];
            shippingAddress = {
              full_name: user.name,
              phone: user.phone,
              email: user.email,
              city: 'Not specified',
              state: 'Not specified',
              country: 'India'
            };
          }
        }
        
        const receiptData = {
          order_id: order.order_id,
          created_at: order.created_at,
          total_amount: order.total_amount,
          payment_method: payments[0]?.payment_method || 'Not specified',
          status: order.status,
          shipping_cost: shippingCost,
          discount_amount: 0,
          shipping_address: shippingAddress,
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
        
        console.log('   Receipt data generated successfully:');
        console.log(`     Order ID: ${receiptData.order_id}`);
        console.log(`     Total Amount: ${receiptData.total_amount}`);
        console.log(`     Status: ${receiptData.status}`);
        console.log(`     Items: ${receiptData.items.length}`);
        console.log(`     Shipping Address: ${receiptData.shipping_address ? 'Available' : 'Not available'}`);
        console.log(`     Payment Info: ${receiptData.payment ? 'Available' : 'Not available'}`);
        
        console.log('\n=== SUCCESS: Admin Receipt Generation Working ===');
        
      } else {
        console.log('   ERROR: Order details not found');
      }
      
    } catch (queryError) {
      console.log('   Query error:', queryError.message);
      console.log('   This is likely the root cause of the admin receipt issue');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    process.exit();
  }
}

// Run the test
testRealAdminReceipt();
