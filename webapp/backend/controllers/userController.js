// ============================================================
// User Controller - Profile, Address Management
// ============================================================
const bcrypt = require('bcrypt');
const db = require('../config/db');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [users] = await db.query(
      'SELECT user_id, name, email, phone, avatar, created_at FROM Users WHERE user_id = ?',
      [userId]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, user: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;
    await db.query('UPDATE Users SET name = ?, phone = ? WHERE user_id = ?', [name, phone, userId]);
    res.status(200).json({ success: true, message: 'Profile updated successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const [users] = await db.query('SELECT password FROM Users WHERE user_id = ?', [userId]);
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE Users SET password = ? WHERE user_id = ?', [hashedPassword, userId]);

    res.status(200).json({ success: true, message: 'Password changed successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const [addresses] = await db.query('SELECT * FROM Address WHERE user_id = ?', [userId]);
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, street, city, state, country, zip_code, is_default } = req.body;

    if (is_default) {
      await db.query('UPDATE Address SET is_default = FALSE WHERE user_id = ?', [userId]);
    }

    const [result] = await db.query(
      'INSERT INTO Address (user_id, full_name, phone, street, city, state, country, zip_code, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, full_name, phone, street, city, state, country || 'India', zip_code, is_default || false]
    );

    res.status(201).json({ success: true, message: 'Address added successfully!', address_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    await db.query('DELETE FROM Address WHERE address_id = ? AND user_id = ?', [addressId, userId]);
    res.status(200).json({ success: true, message: 'Address deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, changePassword, getUserAddresses, addAddress, deleteAddress };
