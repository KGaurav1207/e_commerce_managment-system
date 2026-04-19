// ============================================================
// Populate Inventory Table for Existing Products
// ============================================================
const db = require('./config/db');

async function populateInventory() {
  try {
    console.log('Populating inventory table for existing products...');
    
    // Get all products
    const [products] = await db.query('SELECT Prod_ID FROM Product');
    
    if (products.length === 0) {
      console.log('No products found in database');
      return;
    }
    
    console.log(`Found ${products.length} products`);
    
    // Insert inventory for each product
    for (const product of products) {
      const productId = product.Prod_ID;
      
      // Check if inventory already exists
      const [existingInventory] = await db.query(
        'SELECT * FROM Inventory WHERE product_id = ?',
        [productId]
      );
      
      if (existingInventory.length > 0) {
        console.log(`Inventory already exists for product ${productId}`);
        continue;
      }
      
      // Generate random stock quantity between 10 and 100
      const stockQuantity = Math.floor(Math.random() * 91) + 10;
      
      // Insert inventory record
      await db.query(
        'INSERT INTO Inventory (product_id, stock_quantity) VALUES (?, ?)',
        [productId, stockQuantity]
      );
      
      console.log(`Added inventory for product ${productId}: ${stockQuantity} units`);
    }
    
    // Verify the inventory was added
    const [inventory] = await db.query(`
      SELECT p.Prod_ID, p.name, i.stock_quantity 
      FROM Product p 
      LEFT JOIN Inventory i ON p.Prod_ID = i.product_id
      ORDER BY p.Prod_ID
    `);
    
    console.log('\nInventory Summary:');
    inventory.forEach(item => {
      console.log(`Product ${item.Prod_ID} (${item.name}): ${item.stock_quantity || 'NULL'} units`);
    });
    
    console.log('\nInventory population completed successfully!');
    
  } catch (error) {
    console.error('Error populating inventory:', error);
  } finally {
    process.exit();
  }
}

// Run the script
populateInventory();
