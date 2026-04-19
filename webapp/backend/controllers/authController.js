// ============================================================
// Auth Controller - Register, Login for Users and Admins
// ============================================================
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { ensureWishlistSchema, getColumns, getExistingColumn } = require('../utils/schemaCompat');
require('dotenv').config();

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const passwordLooksHashed = (password) => typeof password === 'string' && password.startsWith('$2');

const verifyPassword = async (connection, tableName, idColumn, idValue, storedPassword, plainPassword) => {
  if (passwordLooksHashed(storedPassword)) {
    return bcrypt.compare(plainPassword, storedPassword);
  }

  const isLegacyMatch = storedPassword === plainPassword;
  if (isLegacyMatch) {
    const upgradedPassword = await bcrypt.hash(plainPassword, 10);
    await connection.query(`UPDATE ${tableName} SET password = ? WHERE ${idColumn} = ?`, [upgradedPassword, idValue]);
  }

  return isLegacyMatch;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const { name, email, phone, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    // Check if user already exists
    await connection.beginTransaction();

    const [existingUser] = await connection.query('SELECT user_id FROM Users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await connection.query(
      'INSERT INTO Users (name, email, phone, password) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, hashedPassword]
    );

    const userId = result.insertId;

    // Auto-create cart and wishlist for new user
    const cartColumns = await getColumns('Cart', connection);
    const cartUserColumn = getExistingColumn(cartColumns, ['user_id', 'User_ID']);
    if (cartUserColumn) {
      await connection.query(`INSERT INTO Cart (${cartUserColumn}) VALUES (?)`, [userId]);
    }

    await ensureWishlistSchema(connection);
    const wishlistColumns = await getColumns('Wishlist', connection);
    const wishlistUserColumn = getExistingColumn(wishlistColumns, ['user_id', 'User_ID']);
    if (wishlistUserColumn) {
      await connection.query(`INSERT INTO Wishlist (${wishlistUserColumn}) VALUES (?)`, [userId]);
    }

    await connection.commit();

    // Generate token
    const token = generateToken(userId, 'user');

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      token,
      user: { user_id: userId, name, email, phone }
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find user by email
    const [users] = await db.query('SELECT user_id, name, email, phone, password FROM Users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];

    // Compare password
    const isMatch = await verifyPassword(db, 'Users', 'user_id', user.user_id, user.password, password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user.user_id, 'user');

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin Login
// @route   POST /api/auth/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const [admins] = await db.query('SELECT admin_id, name, email, password FROM Admin WHERE email = ?', [email]);
    if (admins.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const admin = admins[0];
    const isMatch = await verifyPassword(db, 'Admin', 'admin_id', admin.admin_id, admin.password, password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = generateToken(admin.admin_id, 'admin');

    res.status(200).json({
      success: true,
      message: 'Admin login successful!',
      token,
      admin: {
        admin_id: admin.admin_id,
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser, loginAdmin };
