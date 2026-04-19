const db = require('../config/db');

let tableCache = null;
const columnCache = new Map();

const getTables = async (connection = db) => {
  if (tableCache) return tableCache;

  const [rows] = await connection.query('SHOW TABLES');
  tableCache = new Set(rows.flatMap((row) => Object.values(row)).map((value) => String(value)));
  return tableCache;
};

const hasTable = async (tableName, connection = db) => {
  const tables = await getTables(connection);
  return tables.has(tableName);
};

const getColumns = async (tableName, connection = db) => {
  if (columnCache.has(tableName)) return columnCache.get(tableName);

  const [rows] = await connection.query(`SHOW COLUMNS FROM ${tableName}`);
  const columns = new Set(rows.map((row) => row.Field));
  columnCache.set(tableName, columns);
  return columns;
};

const getExistingColumn = (columns, candidates) => candidates.find((column) => columns.has(column)) || null;

const getSelectExpr = (alias, columns, candidates, fallback, outputAlias) => {
  const column = getExistingColumn(columns, candidates);
  return column ? `${alias}.${column} AS ${outputAlias}` : `${fallback} AS ${outputAlias}`;
};

const buildInsertParts = (payload, allowedColumns) => {
  const columns = Object.keys(payload).filter((column) => allowedColumns.has(column) && payload[column] !== undefined);
  return {
    columns,
    values: columns.map((column) => payload[column])
  };
};

const ensureWishlistSchema = async (connection = db) => {
  if (!(await hasTable('Wishlist', connection))) {
    await connection.query(`
      CREATE TABLE Wishlist (
        wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
      )
    `);
    tableCache = null;
  }

  if (!(await hasTable('Wishlist_Item', connection))) {
    await connection.query(`
      CREATE TABLE Wishlist_Item (
        wishlist_item_id INT AUTO_INCREMENT PRIMARY KEY,
        wishlist_id INT NOT NULL,
        product_id INT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (wishlist_id) REFERENCES Wishlist(wishlist_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE,
        UNIQUE KEY unique_wishlist_product (wishlist_id, product_id)
      )
    `);
    tableCache = null;
  }
};

module.exports = {
  buildInsertParts,
  ensureWishlistSchema,
  getColumns,
  getExistingColumn,
  getSelectExpr,
  getTables,
  hasTable
};
