const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || 'root';
const port = Number(process.env.DB_PORT || 3306);
const database = process.env.DB_NAME || 'ecommerce_db';

const schemaPath = path.resolve(__dirname, '../../database/schema.sql');

async function initializeDatabase() {
  const schema = await fs.readFile(schemaPath, 'utf8');

  const serverConnection = await mysql.createConnection({
    host,
    user,
    password,
    port,
    multipleStatements: true
  });

  await serverConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
  await serverConnection.end();

  const databaseConnection = await mysql.createConnection({
    host,
    user,
    password,
    port,
    database,
    multipleStatements: true,
    charset: 'utf8mb4'
  });

  await databaseConnection.query(schema);
  await databaseConnection.end();

  console.log(`MySQL schema initialized successfully in database: ${database}`);
}

initializeDatabase().catch((error) => {
  console.error('Failed to initialize MySQL schema:');
  console.error(error.message);
  process.exitCode = 1;
});