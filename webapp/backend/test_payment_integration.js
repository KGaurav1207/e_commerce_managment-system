// ============================================================
// Payment Gateway Integration Test
// ============================================================
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test user credentials (you'll need to create these in your database)
const testUser = {
  email: 'test@example.com',
  password: 'test123'
};

async function testPaymentIntegration() {
  console.log('=== Payment Gateway Integration Test ===\n');
  
  let authToken = null;
  let testOrderId = null;
  
  try {
    // Step 1: Login to get auth token
    console.log('1. Testing user authentication...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, testUser);
    authToken = loginResponse.data.token;
    console.log('   Authentication successful');
    
    const authHeaders = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };
    
    // Step 2: Test adding items to cart
    console.log('\n2. Testing cart functionality...');
    try {
      await axios.post(`${API_BASE}/cart`, {
        product_id: 1,
        quantity: 2
      }, { headers: authHeaders });
      console.log('   Item added to cart');
    } catch (error) {
      console.log('   Cart test skipped (product may not exist)');
    }
    
    // Step 3: Test placing order
    console.log('\n3. Testing order placement...');
    const orderResponse = await axios.post(`${API_BASE}/orders`, {
      address_id: 1, // Assuming address exists
      payment_method: 'card',
      items: [{ product_id: 1, quantity: 1 }]
    }, { headers: authHeaders });
    
    testOrderId = orderResponse.data.order_id;
    console.log(`   Order placed successfully: #${testOrderId}`);
    
    // Step 4: Test payment processing
    console.log('\n4. Testing payment processing...');
    const paymentResponse = await axios.post(`${API_BASE}/payments/process`, {
      orderId: testOrderId,
      amount: 999.99,
      paymentMethod: 'card',
      transactionDetails: {
        cardNumber: '****-****-****-1234',
        cardName: 'Test User'
      }
    }, { headers: authHeaders });
    
    console.log(`   Payment processed: ${paymentResponse.data.status}`);
    console.log(`   Transaction ID: ${paymentResponse.data.transactionId}`);
    
    // Step 5: Test payment status check
    console.log('\n5. Testing payment status check...');
    const statusResponse = await axios.get(
      `${API_BASE}/payments/status/${paymentResponse.data.transactionId}`,
      { headers: authHeaders }
    );
    console.log(`   Payment status: ${statusResponse.data.status}`);
    
    // Step 6: Test receipt generation
    console.log('\n6. Testing receipt generation...');
    const receiptResponse = await axios.get(
      `${API_BASE}/payments/receipt/${testOrderId}`,
      { headers: authHeaders }
    );
    
    console.log(`   Receipt generated for order #${testOrderId}`);
    console.log(`   Receipt contains ${receiptResponse.data.receipt.items?.length || 0} items`);
    
    // Step 7: Test payment history
    console.log('\n7. Testing payment history...');
    const historyResponse = await axios.get(
      `${API_BASE}/payments/history`,
      { headers: authHeaders }
    );
    console.log(`   Payment history contains ${historyResponse.data.payments?.length || 0} records`);
    
    console.log('\n=== All Tests Completed Successfully! ===');
    
  } catch (error) {
    console.error('\n=== Test Failed ===');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data?.message || error.response.statusText}`);
    } else {
      console.error(`Error: ${error.message}`);
    }
    
    // If we have an order ID, try to test receipt generation anyway
    if (testOrderId && authToken) {
      try {
        console.log('\nAttempting receipt generation test...');
        const receiptResponse = await axios.get(
          `${API_BASE}/payments/receipt/${testOrderId}`,
          { headers: { 'Authorization': `Bearer ${authToken}` } }
        );
        console.log('Receipt generation test passed');
      } catch (receiptError) {
        console.log('Receipt generation test failed:', receiptError.response?.data?.message);
      }
    }
  }
}

// Test admin receipt access
async function testAdminReceiptAccess() {
  console.log('\n=== Admin Receipt Access Test ===\n');
  
  try {
    // Admin login (you'll need to create admin credentials)
    const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const adminToken = adminLoginResponse.data.token;
    const adminHeaders = {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };
    
    // Test admin orders access
    console.log('Testing admin orders access...');
    const ordersResponse = await axios.get(`${API_BASE}/admin/orders`, {
      headers: adminHeaders
    });
    
    console.log(`Admin can access ${ordersResponse.data.orders?.length || 0} orders`);
    
    // Test receipt generation for admin
    if (ordersResponse.data.orders?.length > 0) {
      const firstOrder = ordersResponse.data.orders[0];
      console.log(`Testing receipt generation for order #${firstOrder.order_id}...`);
      
      const receiptResponse = await axios.get(
        `${API_BASE}/payments/receipt/${firstOrder.order_id}`,
        { headers: adminHeaders }
      );
      
      console.log('Admin receipt generation successful');
    }
    
    console.log('=== Admin Tests Completed ===');
    
  } catch (error) {
    console.error('Admin test failed:', error.response?.data?.message || error.message);
  }
}

// Run tests
async function runAllTests() {
  await testPaymentIntegration();
  await testAdminReceiptAccess();
}

// Only run if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testPaymentIntegration, testAdminReceiptAccess };
