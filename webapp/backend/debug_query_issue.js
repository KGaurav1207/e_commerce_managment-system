// ============================================================
// Debug Query Issue in Admin Receipt
// ============================================================
const db = require('./config/db');

async function debugQueryIssue() {
  try {
    console.log('=== Debug Query Issue ===\n');
    
    // Test the exact query step by step
    console.log('1. Testing basic Orders query...');
    
    try {
      const [orders] = await db.query('SELECT Order_ID FROM Orders LIMIT 1');
      console.log(`   Basic query works: ${orders.length} orders found`);
    } catch (error) {
      console.log('   Basic query failed:', error.message);
    }
    
    console.log('\n2. Testing Orders with Address join...');
    
    try {
      const [orders] = await db.query(
        `SELECT o.Order_ID, a.full_name 
         FROM Orders o 
         LEFT JOIN Address a ON o.address_id = a.address_id 
         LIMIT 1`
      );
      console.log(`   Join query works: ${orders.length} orders found`);
    } catch (error) {
      console.log('   Join query failed:', error.message);
    }
    
    console.log('\n3. Testing the exact admin receipt query...');
    
    try {
      const [orders] = await db.query(
        `SELECT o.Order_ID AS order_id, 
                o.User_ID AS user_id, 
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
         LIMIT 1`
      );
      console.log(`   Admin receipt query works: ${orders.length} orders found`);
    } catch (error) {
      console.log('   Admin receipt query failed:', error.message);
      console.log('   This is the issue we need to fix');
    }
    
    // Let me check if there are any issues with the actual table structure
    console.log('\n4. Checking Orders table structure...');
    
    try {
      const [ordersDesc] = await db.query('DESCRIBE Orders');
      console.log('   Orders table columns:');
      ordersDesc.forEach(col => {
        console.log(`     ${col.Field}: ${col.Type}`);
      });
    } catch (error) {
      console.log('   Error describing Orders table:', error.message);
    }
    
    console.log('\n5. Checking Address table structure...');
    
    try {
      const [addressDesc] = await db.query('DESCRIBE Address');
      console.log('   Address table columns:');
      addressDesc.forEach(col => {
        console.log(`     ${col.Field}: ${col.Type}`);
      });
    } catch (error) {
      console.log('   Error describing Address table:', error.message);
    }
    
  } catch (error) {
    console.error('Debug failed:', error.message);
  } finally {
    process.exit();
  }
}

// Run the debug
debugQueryIssue();
