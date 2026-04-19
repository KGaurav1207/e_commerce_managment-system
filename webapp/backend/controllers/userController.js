// ============================================================
// User Controller - Profile, Address Management
// ============================================================
const bcrypt = require('bcrypt');
const db = require('../config/db');
const { getColumns, getExistingColumn } = require('../utils/schemaCompat');

const normalizeAddress = (address, columns) => ({
  ...address,
  address_id: address.address_id ?? address.Address_ID ?? address.address_ID ?? null,
  full_name: columns.has('full_name') ? address.full_name : (address.full_name || ''),
  phone: columns.has('phone') ? address.phone : (address.phone || ''),
  street: columns.has('street') ? address.street : (address.street || ''),
  zip_code: columns.has('zip_code') ? address.zip_code : (address.zip_code || ''),
  is_default: columns.has('is_default') ? Boolean(address.is_default) : false
});

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
    const columns = await getColumns('Address');
    const addressIdColumn = getExistingColumn(columns, ['address_id', 'Address_ID', 'address_ID']);
    const addressUserColumn = getExistingColumn(columns, ['user_id', 'User_ID', 'user_ID']);
    const [addresses] = await db.query(
      `SELECT *, ${addressIdColumn} AS address_id FROM Address WHERE ${addressUserColumn} = ?`,
      [userId]
    );
    res.status(200).json({
      success: true,
      addresses: addresses.map((address) => normalizeAddress(address, columns))
    });
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
    const columns = await getColumns('Address');
    const addressUserColumn = getExistingColumn(columns, ['user_id', 'User_ID', 'user_ID']);
    const addressDefaultColumn = getExistingColumn(columns, ['is_default', 'Is_Default']);

    if (!city || !state) {
      return res.status(400).json({ success: false, message: 'City and state are required.' });
    }

    if (is_default && addressDefaultColumn) {
      await db.query(`UPDATE Address SET ${addressDefaultColumn} = FALSE WHERE ${addressUserColumn} = ?`, [userId]);
    }

    const insertColumns = [addressUserColumn];
    const insertValues = [userId];

    if (columns.has('full_name')) {
      insertColumns.push('full_name');
      insertValues.push(full_name || '');
    }
    if (columns.has('phone')) {
      insertColumns.push('phone');
      insertValues.push(phone || '');
    }
    if (columns.has('street')) {
      insertColumns.push('street');
      insertValues.push(street || '');
    }

    insertColumns.push('city', 'state');
    insertValues.push(city, state);

    if (columns.has('country')) {
      insertColumns.push('country');
      insertValues.push(country || 'India');
    }
    if (columns.has('zip_code')) {
      insertColumns.push('zip_code');
      insertValues.push(zip_code || '');
    }
    if (addressDefaultColumn) {
      insertColumns.push(addressDefaultColumn);
      insertValues.push(Boolean(is_default));
    }

    const placeholders = insertColumns.map(() => '?').join(', ');
    const [result] = await db.query(
      `INSERT INTO Address (${insertColumns.join(', ')}) VALUES (${placeholders})`,
      insertValues
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
    const columns = await getColumns('Address');
    const addressIdColumn = getExistingColumn(columns, ['address_id', 'Address_ID', 'address_ID']);
    const addressUserColumn = getExistingColumn(columns, ['user_id', 'User_ID', 'user_ID']);
    await db.query(`DELETE FROM Address WHERE ${addressIdColumn} = ? AND ${addressUserColumn} = ?`, [addressId, userId]);
    res.status(200).json({ success: true, message: 'Address deleted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, changePassword, getUserAddresses, addAddress, deleteAddress };
