// ============================================================
// Debug Admin Receipt Function Error
// ============================================================
const db = require('./config/db');

async function debugAdminReceiptError() {
  try {
    console.log('=== Debugging Admin Receipt Error ===\n');
    
    const orderId = 3;
    console.log(`Testing admin receipt for Order ID: ${orderId}`);
    
    // Step 1: Test the exact queries from generateAdminReceipt
    console.log('\n1. Testing Orders Query...');
    
    try {
      const [orders] = await db.query(
        `SELECT o.Order_ID AS order_id, 
                o.User_ID AS user_id, 
                o.total_amount, 
                o.order_date AS created_at,
                o.status
         FROM Orders o
         WHERE o.Order_ID = ?`,
        [orderId]
      );
      
      console.log(`   Orders found: ${orders.length}`);
      
      if (orders.length > 0) {
        const order = orders[0];
        console.log('   Order data:');
        console.log(`     order_id: ${order.order_id}`);
        console.log(`     user_id: ${order.user_id}`);
        console.log(`     total_amount: ${order.total_amount}`);
        console.log(`     created_at: ${order.created_at}`);
        console.log(`     status: ${order.status}`);
        
        // Step 2: Test Order_Detail query
        console.log('\n2. Testing Order_Detail Query...');
        
        try {
          const [items] = await db.query(
            `SELECT od.Prod_ID AS product_id,
                    od.quantity,
                    od.price,
                    p.name,
                    p.image_url
             FROM Order_Detail od
             JOIN Product p ON od.Prod_ID = p.Prod_ID
             WHERE od.order_ID = ?`,
            [orderId]
          );
          
          console.log(`   Items found: ${items.length}`);
          
          items.forEach((item, index) => {
            console.log(`     Item ${index + 1}: ${item.name} (${item.quantity} x ${item.price})`);
          });
          
          // Step 3: Test Payment query
          console.log('\n3. Testing Payment Query...');
          
          try {
            const [payments] = await db.query(
              `SELECT Pay_ID, method as payment_method, pay_date as payment_date 
               FROM Payment 
               WHERE Order_ID = ? 
               ORDER BY pay_date DESC LIMIT 1`,
              [orderId]
            );
            
            console.log(`   Payments found: ${payments.length}`);
            
            if (payments.length > 0) {
              const payment = payments[0];
              console.log(`     Payment: ${payment.Pay_ID} - ${payment.payment_method} - ${payment.payment_date}`);
            }
            
            // Step 4: Test Users query
            console.log('\n4. Testing Users Query...');
            
            try {
              const [users] = await db.query(
                `SELECT u.name, u.email, u.phone
                 FROM Users u
                 WHERE u.User_ID = ?`,
                [order.user_id]
              );
              
              console.log(`   Users found: ${users.length}`);
              
              if (users.length > 0) {
                const user = users[0];
                console.log(`     User: ${user.name} - ${user.email} - ${user.phone}`);
              } else {
                console.log('   No user found for this order');
              }
              
              // Step 5: Simulate receipt data creation
              console.log('\n5. Testing Receipt Data Creation...');
              
              try {
                const shippingCost = parseFloat(order.total_amount) > 499 ? 0 : 49;
                const userInfo = users[0];
                
                const receiptData = {
                  order_id: order.order_id,
                  created_at: order.created_at,
                  total_amount: order.total_amount,
                  payment_method: payments[0]?.payment_method || 'Not specified',
                  status: order.status,
                  shipping_cost: shippingCost,
                  discount_amount: 0,
                  shipping_address: userInfo ? {
                    full_name: userInfo.name,
                    phone: userInfo.phone,
                    email: userInfo.email,
                    street: 'Not specified',
                    city: 'Not specified',
                    state: 'Not specified',
                    zip_code: 'Not specified',
                    country: 'India'
                  } : null,
                  items: items.map(item => ({
                    product_id: item.product_id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    image_url: item.image_url
                  })),
                  payment: payments[0] || null
                };
                
                console.log('   Receipt data created successfully:');
                console.log(`     Order ID: ${receiptData.order_id}`);
                console.log(`     Total Amount: ${receiptData.total_amount}`);
                console.log(`     Status: ${receiptData.status}`);
                console.log(`     Items: ${receiptData.items.length}`);
                console.log(`     Shipping Address: ${receiptData.shipping_address ? 'Available' : 'Not available'}`);
                console.log(`     Payment Info: ${receiptData.payment ? 'Available' : 'Not available'}`);
                
                console.log('\n=== SUCCESS: All queries working ===');
                
              } catch (receiptError) {
                console.log('   Receipt data creation error:', receiptError.message);
              }
              
            } catch (userError) {
              console.log('   Users query error:', userError.message);
            }
            
          } catch (paymentError) {
            console.log('   Payment query error:', paymentError.message);
          }
          
        } catch (itemsError) {
          console.log('   Order_Detail query error:', itemsError.message);
        }
        
      } else {
        console.log('   No order found');
      }
      
    } catch (orderError) {
      console.log('   Orders query error:', orderError.message);
    }
    
  } catch (error) {
    console.error('Debug failed:', error.message);
  } finally {
    process.exit();
  }
}

// Run the debug
debugAdminReceiptError();
