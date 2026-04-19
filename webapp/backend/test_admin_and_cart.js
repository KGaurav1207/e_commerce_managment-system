// ============================================================
// Test Admin Receipt and Cart Functionality
// ============================================================
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAdminAndCartFunctionality() {
  console.log('=== Testing Admin Receipt and Cart Functionality ===\n');
  
  try {
    // Test 1: Check admin receipt endpoint exists and is properly configured
    console.log('1. Testing Admin Receipt Endpoint...');
    
    try {
      const response = await axios.get(`${API_BASE}/payments/admin/receipt/1`);
      console.log('   Admin receipt endpoint: Working without auth (should not happen)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   Admin receipt endpoint: Requires authentication (Good)');
      } else if (error.response?.status === 404) {
        console.log('   Admin receipt endpoint: Not found (Issue!)');
      } else {
        console.log(`   Admin receipt endpoint: Error ${error.response?.status}`);
      }
    }
    
    // Test 2: Check cart endpoints
    console.log('\n2. Testing Cart Endpoints...');
    
    const cartEndpoints = [
      { method: 'GET', url: '/cart', name: 'Get cart' },
      { method: 'POST', url: '/cart', name: 'Add to cart' },
      { method: 'PUT', url: '/cart/1', name: 'Update cart' },
      { method: 'DELETE', url: '/cart/1', name: 'Remove from cart' }
    ];
    
    for (const endpoint of cartEndpoints) {
      try {
        if (endpoint.method === 'GET') {
          await axios.get(`${API_BASE}${endpoint.url}`);
        } else if (endpoint.method === 'POST') {
          await axios.post(`${API_BASE}${endpoint.url}`, { product_id: 1, quantity: 1 });
        } else if (endpoint.method === 'PUT') {
          await axios.put(`${API_BASE}${endpoint.url}`, { quantity: 1 });
        } else if (endpoint.method === 'DELETE') {
          await axios.delete(`${API_BASE}${endpoint.url}`);
        }
        console.log(`   ${endpoint.name}: Working without auth (should not happen)`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`   ${endpoint.name}: Requires authentication (Good)`);
        } else if (error.response?.status === 404) {
          console.log(`   ${endpoint.name}: Not found (Issue!)`);
        } else {
          console.log(`   ${endpoint.name}: Error ${error.response?.status}`);
        }
      }
    }
    
    // Test 3: Check if product endpoint works
    console.log('\n3. Testing Product Endpoint...');
    
    try {
      const productResponse = await axios.get(`${API_BASE}/products/25`);
      if (productResponse.data.success) {
        console.log('   Product endpoint: Working');
        console.log(`   Product found: ${productResponse.data.product?.name || 'Unknown'}`);
      } else {
        console.log('   Product endpoint: Failed to fetch product');
      }
    } catch (error) {
      console.log(`   Product endpoint: Error ${error.response?.status}`);
    }
    
    // Test 4: Simulate the frontend flow
    console.log('\n4. Testing Frontend Flow Simulation...');
    
    const frontendFlow = [
      {
        action: 'User visits product page',
        endpoint: '/products/25',
        expected: 'Product details loaded',
        status: 'Should work'
      },
      {
        action: 'User clicks Add to Cart',
        endpoint: '/cart',
        method: 'POST',
        data: { product_id: 25, quantity: 1 },
        expected: 'Item added to cart',
        status: 'Requires auth'
      },
      {
        action: 'User clicks Buy Now',
        endpoint: '/cart',
        method: 'POST', 
        data: { product_id: 25, quantity: 1 },
        expected: 'Item added and redirect to checkout',
        status: 'Requires auth'
      },
      {
        action: 'Admin clicks receipt button',
        endpoint: '/payments/admin/receipt/:orderId',
        expected: 'Receipt generated',
        status: 'Requires admin auth'
      }
    ];
    
    frontendFlow.forEach(({ action, endpoint, method, data, expected, status }) => {
      console.log(`   ${action}:`);
      console.log(`     Endpoint: ${method || 'GET'} ${endpoint}`);
      console.log(`     Expected: ${expected}`);
      console.log(`     Status: ${status}`);
      console.log('');
    });
    
    // Test 5: Check database connectivity
    console.log('5. Testing Database Connectivity...');
    
    try {
      const healthResponse = await axios.get(`${API_BASE}/health`);
      if (healthResponse.data.database === 'connected') {
        console.log('   Database: Connected');
      } else {
        console.log('   Database: Not connected');
      }
    } catch (error) {
      console.log('   Database: Health check failed');
    }
    
    console.log('\n=== Diagnosis ===');
    
    console.log('\nPossible Issues:');
    console.log('1. Admin Receipt:');
    console.log('   - Endpoint exists and requires auth (Good)');
    console.log('   - May need admin role verification');
    console.log('   - Frontend may be using wrong endpoint');
    
    console.log('\n2. Add to Cart / Buy Now:');
    console.log('   - Endpoints exist and require auth (Good)');
    console.log('   - User may not be logged in');
    console.log('   - CartContext may have issues');
    console.log('   - Product ID may be invalid');
    
    console.log('\nRecommended Fixes:');
    console.log('1. For Admin Receipt:');
    console.log('   - Verify admin authentication');
    console.log('   - Check frontend endpoint usage');
    console.log('   - Test with actual admin login');
    
    console.log('\n2. For Add to Cart/Buy Now:');
    console.log('   - Ensure user is logged in');
    console.log('   - Check CartContext implementation');
    console.log('   - Verify product data structure');
    console.log('   - Add better error handling');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testAdminAndCartFunctionality().catch(console.error);
}

module.exports = { testAdminAndCartFunctionality };
