// ============================================================
// Product Controller - CRUD operations for Products & Categories
// ============================================================
const db = require('../config/db');

// @desc    Get all products with search and filters
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const { search, category, min_price, max_price, sort, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
                  SELECT p.Prod_ID AS product_id, p.name, p.description, p.price,
                    p.image_url, p.Cat_ID AS category_id,
              p.Supplier_ID AS supplier_id, p.Admin_ID AS admin_id,
              p.rating, p.total_reviews,
             c.name AS category_name, s.name AS supplier_name,
             i.stock_quantity
      FROM Product p
      LEFT JOIN Category c ON p.Cat_ID = c.Cat_ID
      LEFT JOIN Supplier s ON p.Supplier_ID = s.Supplier_ID
      LEFT JOIN Inventory i ON p.Prod_ID = i.product_id
      WHERE 1 = 1
    `;
    const params = [];

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      query += ' AND p.Cat_ID = ?';
      params.push(category);
    }
    if (min_price) {
      query += ' AND p.price >= ?';
      params.push(min_price);
    }
    if (max_price) {
      query += ' AND p.price <= ?';
      params.push(max_price);
    }

    // Sorting
    if (sort === 'price_asc') query += ' ORDER BY p.price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY p.price DESC';
    else if (sort === 'rating') query += ' ORDER BY p.Prod_ID DESC';
    else query += ' ORDER BY p.Prod_ID DESC';

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [products] = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM Product p WHERE 1 = 1';
    const countParams = [];
    if (search) { countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }
    if (category) { countQuery += ' AND p.Cat_ID = ?'; countParams.push(category); }
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const [products] = await db.query(
            `SELECT p.Prod_ID AS product_id, p.name, p.description, p.price,
              p.image_url, p.Cat_ID AS category_id,
              p.Supplier_ID AS supplier_id, p.Admin_ID AS admin_id,
              p.rating, p.total_reviews,
              c.name AS category_name,
              s.name AS supplier_name, i.stock_quantity
       FROM Product p
       LEFT JOIN Category c ON p.Cat_ID = c.Cat_ID
       LEFT JOIN Supplier s ON p.Supplier_ID = s.Supplier_ID
       LEFT JOIN Inventory i ON p.Prod_ID = i.product_id
       WHERE p.Prod_ID = ?`,
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Get reviews
    const [reviews] = await db.query(
      `SELECT r.*, u.name AS user_name FROM Review r
       LEFT JOIN Users u ON r.User_ID = u.User_ID
       WHERE r.Prod_ID = ? ORDER BY r.rev_date DESC`,
      [req.params.id]
    );

    res.status(200).json({ success: true, product: products[0], reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product (Admin)
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { name, description, price, discount_price, image_url, category_id, supplier_id, brand, stock_quantity } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Product name and price are required.' });
    }

    const [result] = await db.query(
      `INSERT INTO Product
        (name, description, price, image_url, Cat_ID, Supplier_ID, Admin_ID)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, price, image_url || null, category_id || null, supplier_id || null, adminId]
    );

    const productId = result.insertId;
    await db.query('INSERT INTO Inventory (product_ID, stock_quantity, min_stock_alert) VALUES (?, ?, ?)', [productId, stock_quantity || 0, 10]);

    res.status(201).json({ success: true, message: 'Product created successfully!', product_id: productId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product (Admin)
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, discount_price, image_url, category_id, supplier_id, brand, is_active, stock_quantity } = req.body;

    await db.query(
      `UPDATE Product
       SET name = ?, description = ?, price = ?, image_url = ?, Cat_ID = ?, Supplier_ID = ?
       WHERE Prod_ID = ?`,
      [name, description, price, image_url || null, category_id || null, supplier_id || null, req.params.id]
    );

    if (stock_quantity !== undefined) {
      await db.query('UPDATE Inventory SET stock_quantity = ? WHERE product_ID = ?', [stock_quantity, req.params.id]);
    }

    res.status(200).json({ success: true, message: 'Product updated successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product (Admin)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res) => {
  try {
    await db.query('DELETE FROM Inventory WHERE product_ID = ?', [req.params.id]);
    await db.query('DELETE FROM Product WHERE Prod_ID = ?', [req.params.id]);
    res.status(200).json({ success: true, message: 'Product deleted successfully!' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ success: false, message: 'This product is linked to existing orders and cannot be deleted.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query('SELECT Cat_ID AS category_id, name FROM Category ORDER BY name');
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create category (Admin)
// @route   POST /api/categories
// @access  Admin
const createCategory = async (req, res) => {
  try {
    const { name, description, image_url } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });
    const [result] = await db.query('INSERT INTO Category (name) VALUES (?)', [name]);
    res.status(201).json({ success: true, message: 'Category created!', category_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getAllCategories, createCategory };
