// ============================================================
// Payment Gateway API Endpoints Test
// ============================================================
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPIEndpoints() {
  console.log('=== Payment Gateway API Endpoints Test ===\n');
  
  try {
    // Test 1: Health Check
    console.log('1. Testing API Health...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log(`   Status: ${healthResponse.data.success ? 'Healthy' : 'Unhealthy'}`);
    console.log(`   Database: ${healthResponse.data.database}`);
    
    // Test 2: Check if payment routes exist
    console.log('\n2. Testing Payment Routes...');
    
    try {
      // Test payment process endpoint (should fail without auth, but confirms route exists)
      await axios.post(`${API_BASE}/payments/process`, {});
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   Payment process route exists (requires authentication)');
      } else {
        console.log('   Payment process route may not exist');
      }
    }
    
    try {
      // Test payment status endpoint (should fail without auth, but confirms route exists)
      await axios.get(`${API_BASE}/payments/status/test123`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   Payment status route exists (requires authentication)');
      } else {
        console.log('   Payment status route may not exist');
      }
    }
    
    try {
      // Test receipt generation endpoint (should fail without auth, but confirms route exists)
      await axios.get(`${API_BASE}/payments/receipt/123`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   Receipt generation route exists (requires authentication)');
      } else {
        console.log('   Receipt generation route may not exist');
      }
    }
    
    console.log('\n3. Testing Product Routes (for cart/order testing)...');
    
    try {
      const productsResponse = await axios.get(`${API_BASE}/products`);
      console.log(`   Found ${productsResponse.data.products?.length || 0} products`);
      
      if (productsResponse.data.products?.length > 0) {
        const firstProduct = productsResponse.data.products[0];
        console.log(`   First product: ${firstProduct.name} (ID: ${firstProduct.product_id})`);
      }
    } catch (error) {
      console.log('   Products route test failed');
    }
    
    console.log('\n=== API Endpoints Test Complete ===');
    console.log('\nNote: Full integration testing requires:');
    console.log('- User authentication (login/register)');
    console.log('- Products in database');
    console.log('- Cart functionality');
    console.log('- Order placement');
    console.log('- Valid payment processing');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Test database connectivity for payment tables
async function testDatabaseTables() {
  console.log('\n=== Database Tables Test ===\n');
  
  try {
    // This would require database access - we'll simulate by checking API responses
    console.log('Testing database connectivity through API...');
    
    const healthResponse = await axios.get(`${API_BASE}/health`);
    if (healthResponse.data.database === 'connected') {
      console.log('   Database connection: OK');
      console.log('   Payment tables should be accessible');
    } else {
      console.log('   Database connection: FAILED');
    }
    
  } catch (error) {
    console.error('Database test failed:', error.message);
  }
}

async function runTests() {
  await testAPIEndpoints();
  await testDatabaseTables();
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAPIEndpoints, testDatabaseTables };
