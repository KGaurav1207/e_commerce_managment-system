const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ecommerce_db',
  port: Number(process.env.DB_PORT || 3306),
  multipleStatements: true,
};

async function runMigration() {
  const connection = await mysql.createConnection(config);

  const [usersColumns] = await connection.query('SHOW COLUMNS FROM Users LIKE "email"');
  if (usersColumns.length === 0) {
    await connection.query('ALTER TABLE Users ADD COLUMN email VARCHAR(100) NULL AFTER name');
    await connection.query('CREATE UNIQUE INDEX idx_users_email ON Users (email)');
  }

  const [wishlistTable] = await connection.query("SHOW TABLES LIKE 'Wishlist'");
  if (wishlistTable.length === 0) {
    await connection.query(`
      CREATE TABLE Wishlist (
        wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(User_ID) ON DELETE CASCADE
      )
    `);
  }

  const [wishlistItemTable] = await connection.query("SHOW TABLES LIKE 'Wishlist_Item'");
  if (wishlistItemTable.length === 0) {
    await connection.query(`
      CREATE TABLE Wishlist_Item (
        wishlist_item_id INT AUTO_INCREMENT PRIMARY KEY,
        wishlist_id INT NOT NULL,
        product_id INT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (wishlist_id) REFERENCES Wishlist(wishlist_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES Product(Prod_ID) ON DELETE CASCADE,
        UNIQUE KEY unique_wishlist_product (wishlist_id, product_id)
      )
    `);
  }

  const [existingAdmin] = await connection.query('SELECT Admin_ID FROM Admin WHERE email = ?', ['admin@shopmart.com']);
  if (existingAdmin.length === 0) {
    await connection.query(
      'INSERT INTO Admin (name, email, password) VALUES (?, ?, ?)',
      ['Super Admin', 'admin@shopmart.com', await bcrypt.hash('Admin@123', 10)]
    );
  } else {
    await connection.query('UPDATE Admin SET password = ? WHERE email = ?', [await bcrypt.hash('Admin@123', 10), 'admin@shopmart.com']);
  }

  await connection.end();
  console.log('Authentication schema migration completed successfully.');
}

runMigration().catch((error) => {
  console.error('Authentication schema migration failed:');
  console.error(error.message);
  process.exitCode = 1;
});