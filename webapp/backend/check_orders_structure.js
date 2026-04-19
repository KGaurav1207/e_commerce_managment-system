// ============================================================
// Check Orders Table Structure
// ============================================================
const db = require('./config/db');

async function checkOrdersStructure() {
  try {
    console.log('=== Checking Orders Table Structure ===\n');
    
    // Get Orders table structure
    const [ordersDesc] = await db.query('DESCRIBE Orders');
    console.log('Orders table columns:');
    ordersDesc.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type}`);
    });
    
    console.log('\nChecking for address relationships...');
    
    // Check if there's any address-related column
    const addressColumns = ordersDesc.filter(col => 
      col.Field.toLowerCase().includes('address')
    );
    
    if (addressColumns.length > 0) {
      console.log('Address-related columns found:');
      addressColumns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type}`);
      });
    } else {
      console.log('No address-related columns found in Orders table');
      console.log('This explains why the join fails');
    }
    
    // Check if we can get orders with user info
    console.log('\nTesting Orders with User info...');
    
    try {
      const [ordersWithUsers] = await db.query(
        `SELECT o.Order_ID, o.User_ID, u.name, u.email
         FROM Orders o
         LEFT JOIN Users u ON o.User_ID = u.User_ID
         LIMIT 3`
      );
      
      console.log(`Orders with user info: ${ordersWithUsers.length}`);
      ordersWithUsers.forEach(order => {
        console.log(`  Order ${order.Order_ID}: User ${order.User_ID} (${order.name || 'Unknown'})`);
      });
      
    } catch (error) {
      console.log('Error getting orders with users:', error.message);
    }
    
    console.log('\n=== Solution ===');
    console.log('The Orders table does not have an address_id column');
    console.log('We need to either:');
    console.log('1. Remove the address join completely from admin receipt');
    console.log('2. Get address info from Users table instead');
    console.log('3. Add address_id column to Orders table');
    
  } catch (error) {
    console.error('Check failed:', error.message);
  } finally {
    process.exit();
  }
}

// Run the check
checkOrdersStructure();
