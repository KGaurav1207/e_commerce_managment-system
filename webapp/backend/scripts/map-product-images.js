const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const IMAGE_DIR = path.join(__dirname, '..', 'images');
const IMAGE_BASE = process.env.BACKEND_IMAGE_BASE_URL || 'http://localhost:5000/api/images';

const normalize = (value) =>
  (value || '')
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const keywordMap = {
  dbms: 'dbms_book',
  'c plus plus': 'cpp_book',
  python: 'python_book',
  dsa: 'dsa_book',
  'operating system': 'os_book',
  'os book': 'os_book',
  tennis: 'tennis_ball',
  badminton: 'badminton_racket',
  cricket: 'cricket_bat',
  football: 'football',
  smartphone: 'smartphone',
  'smart tv': 'smart_tv',
  laptop: 'laptop',
  'bluetooth speaker': 'bluetooth_speaker',
  'mixer grinder': 'mixer_grinder',
  cookware: 'cookware_set',
  'water bottle': 'water_bottle',
  'gas stove': 'gas_stove',
  hoodie: 'hoodie',
  jacket: 'jacket',
  jeans: 'jeans',
  't shirt': 'tshirt',
};

const findImageFile = (productName, files) => {
  const normalizedName = normalize(productName);

  for (const [keyword, mappedBase] of Object.entries(keywordMap)) {
    if (normalizedName.includes(keyword)) {
      const exact = files.find((file) => file.base === mappedBase);
      if (exact) return exact.file;
    }
  }

  const compactName = normalizedName.replace(/\s+/g, '_');
  const direct = files.find((file) => compactName.includes(file.base) || file.base.includes(compactName));
  if (direct) return direct.file;

  return null;
};

async function mapImagesToProducts() {
  const imageEntries = await fs.readdir(IMAGE_DIR);
  const files = imageEntries
    .filter((file) => /\.(png|jpe?g|webp|gif)$/i.test(file))
    .map((file) => ({ file, base: path.parse(file).name.toLowerCase() }));

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ecommerce_db',
    port: Number(process.env.DB_PORT || 3306),
  });

  const [products] = await connection.query('SELECT Prod_ID, name FROM Product ORDER BY Prod_ID ASC');

  let updated = 0;
  const unmatched = [];

  for (const product of products) {
    const imageFile = findImageFile(product.name, files);
    if (!imageFile) {
      unmatched.push(product.name);
      continue;
    }

    const imageUrl = `${IMAGE_BASE}/${encodeURIComponent(imageFile)}`;
    await connection.query('UPDATE Product SET image_url = ? WHERE Prod_ID = ?', [imageUrl, product.Prod_ID]);
    updated += 1;
  }

  await connection.end();

  console.log(`Updated image_url for ${updated} products.`);
  if (unmatched.length > 0) {
    console.log('No matching image for:');
    unmatched.forEach((name) => console.log(`- ${name}`));
  }
}

mapImagesToProducts().catch((error) => {
  console.error('Failed to map images to products:');
  console.error(error.message);
  process.exitCode = 1;
});