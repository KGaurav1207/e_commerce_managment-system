// ============================================================
// Final Test - Admin Receipt with Real Database Schema
// ============================================================
const db = require('./config/db');

async function testFinalAdminReceiptFix() {
  console.log('=== Final Admin Receipt Database Schema Test ===\n');
  
  const connection = await db.getConnection();
  
  try {
    // Test 1: Verify Orders table structure
    console.log('1. Testing Orders table structure...');
    
    const [ordersDesc] = await connection.query('DESCRIBE Orders');
    console.log('   Orders table columns:');
    ordersDesc.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}`);
    });
    
    // Test 2: Verify Address table structure  
    console.log('\n2. Testing Address table structure...');
    
    const [addressDesc] = await connection.query('DESCRIBE Address');
    console.log('   Address table columns:');
    addressDesc.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}`);
    });
    
    // Test 3: Verify Payment table structure
    console.log('\n3. Testing Payment table structure...');
    
    const [paymentDesc] = await connection.query('DESCRIBE Payment');
    console.log('   Payment table columns:');
    paymentDesc.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type}`);
    });
    
    // Test 4: Test the actual admin receipt query
    console.log('\n4. Testing admin receipt query...');
    
    const testOrderId = 1; // Use a test order ID
    
    const [orders] = await connection.query(
      `SELECT o.order_id, 
              o.user_id, 
              o.total_amount, 
              o.order_date AS created_at,
              o.status,
              a.full_name,
              a.phone,
              a.street,
              a.city,
              a.state,
              a.zip_code,
              a.country
       FROM Orders o
       LEFT JOIN Address a ON o.address_id = a.address_id
       WHERE o.order_id = ?`,
      [testOrderId]
    );
    
    if (orders.length > 0) {
      console.log('   Query executed successfully!');
      console.log('   Found order:', orders[0].order_id);
      console.log('   Has address info:', orders[0].full_name ? 'Yes' : 'No');
    } else {
      console.log('   No orders found (this is expected if database is empty)');
    }
    
    // Test 5: Test order items query
    console.log('\n5. Testing order items query...');
    
    const [items] = await connection.query(
      `SELECT od.product_id,
              od.quantity,
              od.price,
              p.name,
              p.image_url,
              p.discount_price
       FROM Order_Detail od
       JOIN Product p ON od.product_id = p.product_id
       WHERE od.order_id = ?`,
      [testOrderId]
    );
    
    console.log(`   Found ${items.length} items for order ${testOrderId}`);
    
    // Test 6: Test payment query
    console.log('\n6. Testing payment query...');
    
    const [payments] = await connection.query(
      `SELECT transaction_id, method as payment_method, paid_at as payment_date, status 
       FROM Payment 
       WHERE order_id = ? AND status = 'SUCCESS'
       ORDER BY paid_at DESC LIMIT 1`,
      [testOrderId]
    );
    
    console.log(`   Found ${payments.length} successful payments for order ${testOrderId}`);
    
    // Test 7: Verify the schema matches our expectations
    console.log('\n7. Schema verification...');
    
    const expectedSchema = {
      Orders: ['order_id', 'user_id', 'address_id', 'total_amount', 'status', 'order_date'],
      Address: ['address_id', 'user_id', 'full_name', 'phone', 'street', 'city', 'state', 'zip_code', 'country'],
      Payment: ['payment_id', 'order_id', 'method', 'amount', 'status', 'transaction_id', 'paid_at'],
      Order_Detail: ['order_detail_id', 'order_id', 'product_id', 'quantity', 'price'],
      Product: ['product_id', 'name', 'price', 'discount_price', 'image_url']
    };
    
    let schemaMatches = true;
    
    for (const [table, expectedColumns] of Object.entries(expectedSchema)) {
      const [actualColumns] = await connection.query(`DESCRIBE ${table}`);
      const actualColumnNames = actualColumns.map(col => col.Field);
      
      const missingColumns = expectedColumns.filter(col => !actualColumnNames.includes(col));
      const extraColumns = actualColumnNames.filter(col => !expectedColumns.includes(col));
      
      if (missingColumns.length > 0 || extraColumns.length > 0) {
        console.log(`   ${table} table schema mismatch:`);
        if (missingColumns.length > 0) {
          console.log(`     Missing: ${missingColumns.join(', ')}`);
        }
        if (extraColumns.length > 0) {
          console.log(`     Extra: ${extraColumns.join(', ')}`);
        }
        schemaMatches = false;
      } else {
        console.log(`   ${table} table: Schema matches!`);
      }
    }
    
    // Final result
    console.log('\n=== Test Results ===');
    
    if (schemaMatches) {
      console.log('Database schema matches admin receipt function!');
      console.log('The admin receipt function should work correctly.');
    } else {
      console.log('Schema mismatches found - function may need adjustments.');
    }
    
    console.log('\nAdmin receipt function fixes applied:');
    console.log('1. Corrected table column names (order_id vs Order_ID)');
    console.log('2. Fixed Payment table name (not Payments)');
    console.log('3. Added proper Address table join');
    console.log('4. Updated column aliases to match schema');
    console.log('5. Added fallback to Users table if address missing');
    
  } catch (error) {
    console.error('Test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    connection.release();
  }
}

// Run the test
if (require.main === module) {
  testFinalAdminReceiptFix().catch(console.error);
}

module.exports = { testFinalAdminReceiptFix };
