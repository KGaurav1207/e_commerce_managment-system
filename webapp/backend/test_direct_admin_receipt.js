// ============================================================
// Test Admin Receipt Function Directly
// ============================================================
const { generateAdminReceipt } = require('./controllers/paymentController');

async function testDirectAdminReceipt() {
  try {
    console.log('=== Testing Admin Receipt Function Directly ===\n');
    
    // Mock request and response objects
    const mockReq = {
      params: { orderId: '3' }
    };
    
    let responseData = null;
    let statusCode = null;
    
    const mockRes = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
            console.log(`Response Status: ${statusCode}`);
            console.log('Response Data:', JSON.stringify(data, null, 2));
          }
        };
      }
    };
    
    // Call the function directly
    await generateAdminReceipt(mockReq, mockRes);
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Direct test error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testDirectAdminReceipt();
