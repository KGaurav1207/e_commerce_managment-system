// ============================================================
// Deep Debug Admin Receipt Generation
// ============================================================
const db = require('./config/db');

async function debugAdminReceipt() {
  try {
    console.log('=== Deep Debug: Admin Receipt Generation ===\n');
    
    // Step 1: Check if there are any orders in the database
    console.log('1. Checking Orders in Database...');
    
    try {
      const [orders] = await db.query('SELECT Order_ID, User_ID, total_amount, status, order_date FROM Orders LIMIT 5');
      
      if (orders.length === 0) {
        console.log('   No orders found in database');
        console.log('   This might be why admin receipt fails - no orders to generate receipts for');
        
        // Let's create a test order
        console.log('\n2. Creating Test Order...');
        await createTestOrder();
      } else {
        console.log(`   Found ${orders.length} orders:`);
        orders.forEach(order => {
          console.log(`     Order ${order.Order_ID}: User ${order.User_ID}, Amount ${order.total_amount}, Status ${order.status}`);
        });
      }
    } catch (error) {
      console.log('   Error checking orders:', error.message);
    }
    
    // Step 2: Check admin receipt controller logic
    console.log('\n3. Testing Admin Receipt Controller Logic...');
    
    // Get first order ID to test
    const [orderCheck] = await db.query('SELECT Order_ID FROM Orders LIMIT 1');
    
    if (orderCheck.length > 0) {
      const testOrderId = orderCheck[0].Order_ID;
      console.log(`   Testing with Order ID: ${testOrderId}`);
      
      // Test the exact query used in generateAdminReceipt
      console.log('\n4. Testing Admin Receipt Query...');
      
      try {
        const [orders] = await db.query(
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
           LEFT JOIN User_Address a ON o.address_id = a.Address_ID
           WHERE o.Order_ID = ?`,
          [testOrderId]
        );
        
        console.log(`   Query result: ${orders.length} orders found`);
        
        if (orders.length > 0) {
          const order = orders[0];
          console.log('   Order data:');
          console.log(`     order_id: ${order.order_id}`);
          console.log(`     user_id: ${order.user_id}`);
          console.log(`     total_amount: ${order.total_amount}`);
          console.log(`     payment_method: ${order.payment_method}`);
          console.log(`     status: ${order.status}`);
          
          // Test order items query
          console.log('\n5. Testing Order Items Query...');
          
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
          } else {
            console.log('   No items found for this order');
          }
          
          // Test payments query
          console.log('\n6. Testing Payments Query...');
          
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
            console.log('   No successful payments found for this order');
          }
          
        } else {
          console.log('   No order data found - this is the problem!');
        }
        
      } catch (queryError) {
        console.log('   Query error:', queryError.message);
      }
    }
    
    // Step 3: Check if admin receipt route is properly registered
    console.log('\n7. Checking Route Registration...');
    
    try {
      const fs = require('fs');
      const routesPath = './routes/paymentRoutes.js';
      
      if (fs.existsSync(routesPath)) {
        const routesContent = fs.readFileSync(routesPath, 'utf8');
        
        if (routesContent.includes('/admin/receipt')) {
          console.log('   Admin receipt route: Found in paymentRoutes.js');
        } else {
          console.log('   Admin receipt route: NOT found in paymentRoutes.js');
        }
        
        if (routesContent.includes('generateAdminReceipt')) {
          console.log('   generateAdminReceipt function: Found in routes');
        } else {
          console.log('   generateAdminReceipt function: NOT found in routes');
        }
      } else {
        console.log('   paymentRoutes.js file not found');
      }
    } catch (error) {
      console.log('   Error checking routes:', error.message);
    }
    
    // Step 4: Check if admin receipt function exists in controller
    console.log('\n8. Checking Controller Function...');
    
    try {
      const fs = require('fs');
      const controllerPath = './controllers/paymentController.js';
      
      if (fs.existsSync(controllerPath)) {
        const controllerContent = fs.readFileSync(controllerPath, 'utf8');
        
        if (controllerContent.includes('generateAdminReceipt')) {
          console.log('   generateAdminReceipt function: Found in controller');
        } else {
          console.log('   generateAdminReceipt function: NOT found in controller');
        }
        
        if (controllerContent.includes('module.exports')) {
          const exportsMatch = controllerContent.match(/module\.exports = \{([^}]+)\}/);
          if (exportsMatch) {
            console.log(`   Exported functions: ${exportsMatch[1]}`);
            
            if (exportsMatch[1].includes('generateAdminReceipt')) {
              console.log('   generateAdminReceipt: Properly exported');
            } else {
              console.log('   generateAdminReceipt: NOT properly exported');
            }
          }
        }
      } else {
        console.log('   paymentController.js file not found');
      }
    } catch (error) {
      console.log('   Error checking controller:', error.message);
    }
    
    console.log('\n=== Debug Complete ===');
    
  } catch (error) {
    console.error('Debug failed:', error.message);
  } finally {
    process.exit();
  }
}

// Create a test order if none exists
async function createTestOrder() {
  try {
    console.log('   Creating test order...');
    
    // Get a user and product
    const [users] = await db.query('SELECT User_ID FROM Users LIMIT 1');
    const [products] = await db.query('SELECT Prod_ID, price FROM Product LIMIT 1');
    
    if (users.length === 0 || products.length === 0) {
      console.log('   No users or products found to create test order');
      return;
    }
    
    const userId = users[0].User_ID;
    const productId = products[0].Prod_ID;
    const price = products[0].price;
    
    // Insert order
    const [orderResult] = await db.query(
      'INSERT INTO Orders (User_ID, total_amount, status, payment_method) VALUES (?, ?, ?, ?)',
      [userId, price, 'pending', 'cod']
    );
    
    const orderId = orderResult.insertId;
    
    // Insert order item
    await db.query(
      'INSERT INTO Order_Detail (order_ID, Prod_ID, quantity, price) VALUES (?, ?, ?, ?)',
      [orderId, productId, 1, price]
    );
    
    console.log(`   Test order created: Order ${orderId}`);
    
  } catch (error) {
    console.log('   Error creating test order:', error.message);
  }
}

// Run the debug
debugAdminReceipt();
