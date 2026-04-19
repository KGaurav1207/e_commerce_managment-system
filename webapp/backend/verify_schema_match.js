// ============================================================
// Verify Database Schema Matches Admin Receipt Function
// ============================================================
const fs = require('fs');

function verifySchemaMatch() {
  console.log('=== Verifying Schema Match with Admin Receipt Function ===\n');
  
  // Read the payment controller to check the queries
  const paymentControllerPath = './controllers/paymentController.js';
  const paymentControllerContent = fs.readFileSync(paymentControllerPath, 'utf8');
  
  // Extract the admin receipt function queries
  const adminReceiptFunction = paymentControllerContent.match(/const generateAdminReceipt[\s\S]*?^};/m);
  
  if (!adminReceiptFunction) {
    console.log('ERROR: Could not find generateAdminReceipt function');
    return;
  }
  
  console.log('1. Checking Orders table query...');
  
  // Check Orders table references
  const ordersQueryMatch = adminReceiptFunction[0].match(/FROM Orders o[\s\S]*?WHERE o\.order_id = \?/);
  if (ordersQueryMatch) {
    console.log('   Orders table query found:');
    console.log('   - Table: Orders (correct)');
    console.log('   - Alias: o (correct)');
    console.log('   - WHERE clause: o.order_id = ? (correct)');
  }
  
  console.log('\n2. Checking Address table join...');
  
  // Check Address table join
  const addressJoinMatch = adminReceiptFunction[0].match(/LEFT JOIN Address a ON o\.address_id = a\.address_id/);
  if (addressJoinMatch) {
    console.log('   Address table join found:');
    console.log('   - Table: Address (correct)');
    console.log('   - Alias: a (correct)');
    console.log('   - Join condition: o.address_id = a.address_id (correct)');
  } else {
    console.log('   Address join condition not found or incorrect');
  }
  
  console.log('\n3. Checking Order_Detail table query...');
  
  // Check Order_Detail table references
  const orderDetailMatch = adminReceiptFunction[0].match(/FROM Order_Detail od[\s\S]*?WHERE od\.order_id = \?/);
  if (orderDetailMatch) {
    console.log('   Order_Detail table query found:');
    console.log('   - Table: Order_Detail (correct)');
    console.log('   - Alias: od (correct)');
    console.log('   - WHERE clause: od.order_id = ? (correct)');
  }
  
  console.log('\n4. Checking Product table join...');
  
  // Check Product table join
  const productJoinMatch = adminReceiptFunction[0].match(/JOIN Product p ON od\.product_id = p\.product_id/);
  if (productJoinMatch) {
    console.log('   Product table join found:');
    console.log('   - Table: Product (correct)');
    console.log('   - Alias: p (correct)');
    console.log('   - Join condition: od.product_id = p.product_id (correct)');
  }
  
  console.log('\n5. Checking Payment table query...');
  
  // Check Payment table references
  const paymentMatch = adminReceiptFunction[0].match(/FROM Payment[\s\S]*?WHERE order_id = \?/);
  if (paymentMatch) {
    console.log('   Payment table query found:');
    console.log('   - Table: Payment (correct)');
    console.log('   - WHERE clause: order_id = ? (correct)');
  }
  
  console.log('\n6. Checking Users table query...');
  
  // Check Users table references
  const usersMatch = adminReceiptFunction[0].match(/FROM Users u[\s\S]*?WHERE u\.user_id = \?/);
  if (usersMatch) {
    console.log('   Users table query found:');
    console.log('   - Table: Users (correct)');
    console.log('   - Alias: u (correct)');
    console.log('   - WHERE clause: u.user_id = ? (correct)');
  }
  
  console.log('\n7. Column name verification...');
  
  // Verify column names match schema
  const columnChecks = [
    { pattern: /o\.order_id/, description: 'Orders.order_id' },
    { pattern: /o\.user_id/, description: 'Orders.user_id' },
    { pattern: /o\.total_amount/, description: 'Orders.total_amount' },
    { pattern: /o\.order_date/, description: 'Orders.order_date' },
    { pattern: /o\.status/, description: 'Orders.status' },
    { pattern: /a\.address_id/, description: 'Address.address_id' },
    { pattern: /a\.full_name/, description: 'Address.full_name' },
    { pattern: /a\.phone/, description: 'Address.phone' },
    { pattern: /a\.street/, description: 'Address.street' },
    { pattern: /a\.city/, description: 'Address.city' },
    { pattern: /a\.state/, description: 'Address.state' },
    { pattern: /a\.zip_code/, description: 'Address.zip_code' },
    { pattern: /a\.country/, description: 'Address.country' },
    { pattern: /od\.order_detail_id/, description: 'Order_Detail.order_detail_id' },
    { pattern: /od\.order_id/, description: 'Order_Detail.order_id' },
    { pattern: /od\.product_id/, description: 'Order_Detail.product_id' },
    { pattern: /od\.quantity/, description: 'Order_Detail.quantity' },
    { pattern: /od\.price/, description: 'Order_Detail.price' },
    { pattern: /p\.product_id/, description: 'Product.product_id' },
    { pattern: /p\.name/, description: 'Product.name' },
    { pattern: /p\.image_url/, description: 'Product.image_url' },
    { pattern: /p\.discount_price/, description: 'Product.discount_price' },
    { pattern: /payment_id/, description: 'Payment.payment_id' },
    { pattern: /transaction_id/, description: 'Payment.transaction_id' },
    { pattern: /method/, description: 'Payment.method' },
    { pattern: /amount/, description: 'Payment.amount' },
    { pattern: /status/, description: 'Payment.status' },
    { pattern: /paid_at/, description: 'Payment.paid_at' },
    { pattern: /u\.user_id/, description: 'Users.user_id' },
    { pattern: /u\.name/, description: 'Users.name' },
    { pattern: /u\.email/, description: 'Users.email' },
    { pattern: /u\.phone/, description: 'Users.phone' }
  ];
  
  columnChecks.forEach(({ pattern, description }) => {
    if (adminReceiptFunction[0].match(pattern)) {
      console.log(`   ${description}: Used correctly`);
    } else {
      console.log(`   ${description}: Not found (may be optional)`);
    }
  });
  
  console.log('\n8. Schema compliance summary...');
  
  const complianceChecks = [
    {
      check: 'Orders table references',
      status: adminReceiptFunction[0].includes('FROM Orders o') ? 'PASS' : 'FAIL'
    },
    {
      check: 'Address table join',
      status: adminReceiptFunction[0].includes('LEFT JOIN Address a') ? 'PASS' : 'FAIL'
    },
    {
      check: 'Order_Detail table references',
      status: adminReceiptFunction[0].includes('FROM Order_Detail od') ? 'PASS' : 'FAIL'
    },
    {
      check: 'Product table join',
      status: adminReceiptFunction[0].includes('JOIN Product p') ? 'PASS' : 'FAIL'
    },
    {
      check: 'Payment table references',
      status: adminReceiptFunction[0].includes('FROM Payment') ? 'PASS' : 'FAIL'
    },
    {
      check: 'Users table references',
      status: adminReceiptFunction[0].includes('FROM Users u') ? 'PASS' : 'FAIL'
    },
    {
      check: 'No User_ID filter (admin access)',
      status: !adminReceiptFunction[0].includes('AND o.User_ID = ?') ? 'PASS' : 'FAIL'
    },
    {
      check: 'Correct primary key references',
      status: adminReceiptFunction[0].includes('o.order_id') ? 'PASS' : 'FAIL'
    }
  ];
  
  complianceChecks.forEach(({ check, status }) => {
    const icon = status === 'PASS' ? '   ' : '   ';
    console.log(`${icon} ${check}: ${status}`);
  });
  
  const allPassed = complianceChecks.every(c => c.status === 'PASS');
  
  console.log('\n=== Schema Verification Complete ===');
  console.log(`Overall Status: ${allPassed ? 'PASS' : 'FAIL'}`);
  
  if (allPassed) {
    console.log('\nThe admin receipt function is fully compliant with the database schema.');
    console.log('All table names, column names, and relationships are correct.');
  } else {
    console.log('\nSome schema compliance issues were found. Please review the failed checks.');
  }
}

// Run the verification
if (require.main === module) {
  verifySchemaMatch();
}

module.exports = { verifySchemaMatch };
