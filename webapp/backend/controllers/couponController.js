// ============================================================
// Coupon Controller - Manage discount coupons
// ============================================================
const db = require('../config/db');

// @desc    Validate and apply coupon
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = async (req, res) => {
  try {
    const { code, order_amount } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    // Check if coupon exists and is valid
    const [coupon] = await db.query(
      `SELECT * FROM Coupon 
       WHERE code = ? AND is_active = TRUE 
       AND (end_date IS NULL OR end_date >= CURDATE())
       AND start_date <= CURDATE()`,
      [code]
    );

    if (coupon.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid coupon code.' });
    }

    const couponData = coupon[0];

    // Check minimum order amount
    if (couponData.minimum_amount && order_amount < couponData.minimum_amount) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order amount of ₹${couponData.minimum_amount} required for this coupon.` 
      });
    }

    // Check usage limit
    if (couponData.usage_limit) {
      const [usageCount] = await db.query(
        'SELECT COUNT(*) as usage_count FROM Coupon_Usage WHERE coupon_id = ?',
        [couponData.coupon_id]
      );

      if (usageCount[0].usage_count >= couponData.usage_limit) {
        return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached.' });
      }
    }

    // Check if user has already used this coupon
    if (userId) {
      const [userUsage] = await db.query(
        'SELECT * FROM Coupon_Usage WHERE coupon_id = ? AND user_id = ?',
        [couponData.coupon_id, userId]
      );

      if (userUsage.length > 0) {
        return res.status(400).json({ success: false, message: 'You have already used this coupon.' });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (couponData.discount_type === 'percentage') {
      discountAmount = (order_amount * couponData.discount_value) / 100;
    } else {
      discountAmount = couponData.discount_value;
    }

    res.status(200).json({
      success: true,
      coupon: {
        code: couponData.code,
        description: couponData.description,
        discount_type: couponData.discount_type,
        discount_value: couponData.discount_value,
        minimum_amount: couponData.minimum_amount,
        discount_amount: Math.min(discountAmount, order_amount)
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active coupons
// @route   GET /api/coupons
// @access  Public
const getActiveCoupons = async (req, res) => {
  try {
    const [coupons] = await db.query(
      `SELECT c.*, COUNT(cu.usage_id) as usage_count
       FROM Coupon c
       LEFT JOIN Coupon_Usage cu ON c.coupon_id = cu.coupon_id
       WHERE c.is_active = TRUE
       AND (c.end_date IS NULL OR c.end_date >= CURDATE())
       AND c.start_date <= CURDATE()
       GROUP BY c.coupon_id
       ORDER BY c.created_at DESC`
    );

    res.status(200).json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get coupons eligible for user with cart amount + used status
// @route   GET /api/coupons/eligible?amount=X
// @access  Private
const getEligibleCoupons = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderAmount = parseFloat(req.query.amount) || 0;

    const [coupons] = await db.query(
      `SELECT c.*,
              COUNT(cu.usage_id) as usage_count,
              MAX(CASE WHEN cu.user_id = ? THEN 1 ELSE 0 END) as already_used
       FROM Coupon c
       LEFT JOIN Coupon_Usage cu ON c.coupon_id = cu.coupon_id
       WHERE c.is_active = TRUE
       AND (c.end_date IS NULL OR c.end_date >= CURDATE())
       AND c.start_date <= CURDATE()
       GROUP BY c.coupon_id
       ORDER BY c.discount_type DESC, c.discount_value DESC`,
      [userId]
    );

    const result = coupons.map(c => ({
      ...c,
      usage_count: c.usage_count || 0,
      already_used: Boolean(c.already_used),
      limit_reached: c.usage_limit ? c.usage_count >= c.usage_limit : false,
      applicable: orderAmount >= parseFloat(c.minimum_amount || 0),
    }));

    res.status(200).json({ success: true, coupons: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply coupon and create usage record
// @route   POST /api/coupons/apply
// @access  Private
const applyCoupon = async (req, res) => {
  try {
    const { code, order_id, discount_amount } = req.body;
    const userId = req.user.id;

    if (!code || !order_id || !discount_amount) {
      return res.status(400).json({ success: false, message: 'Code, order ID, and discount amount are required.' });
    }

    const [coupon] = await db.query(
      `SELECT * FROM Coupon WHERE code = ? AND is_active = TRUE AND (end_date IS NULL OR end_date >= CURDATE()) AND start_date <= CURDATE()`,
      [code]
    );

    if (coupon.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    const couponData = coupon[0];

    const [alreadyUsed] = await db.query(
      'SELECT * FROM Coupon_Usage WHERE coupon_id = ? AND user_id = ?',
      [couponData.coupon_id, userId]
    );
    if (alreadyUsed.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already used this coupon.' });
    }

    await db.query(
      'INSERT INTO Coupon_Usage (coupon_id, user_id, order_id, discount_amount) VALUES (?, ?, ?, ?)',
      [couponData.coupon_id, userId, order_id, discount_amount]
    );

    res.status(201).json({ success: true, message: 'Coupon applied successfully!' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new coupon (Admin only)
// @route   POST /api/coupons
// @access  Admin
const createCoupon = async (req, res) => {
  try {
    const { code, description, discount_type, discount_value, minimum_amount, usage_limit, end_date } = req.body;
    const adminId = req.admin.id;

    if (!code || !discount_type || !discount_value) {
      return res.status(400).json({ success: false, message: 'Code, discount type, and discount value are required.' });
    }

    await db.query(
      'INSERT INTO Coupon (code, description, discount_type, discount_value, minimum_amount, usage_limit, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [code, description, discount_type, discount_value, minimum_amount, usage_limit, end_date]
    );

    res.status(201).json({ success: true, message: 'Coupon created successfully!' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update coupon (Admin only)
// @route   PUT /api/coupons/:id
// @access  Admin
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, description, discount_type, discount_value, minimum_amount, usage_limit, end_date, is_active } = req.body;
    const adminId = req.admin.id;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Coupon ID is required.' });
    }

    const [existing] = await db.query('SELECT * FROM Coupon WHERE coupon_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    const updateFields = {};
    if (code !== undefined) updateFields.code = code;
    if (description !== undefined) updateFields.description = description;
    if (discount_type !== undefined) updateFields.discount_type = discount_type;
    if (discount_value !== undefined) updateFields.discount_value = discount_value;
    if (minimum_amount !== undefined) updateFields.minimum_amount = minimum_amount;
    if (usage_limit !== undefined) updateFields.usage_limit = usage_limit;
    if (end_date !== undefined) updateFields.end_date = end_date;
    if (is_active !== undefined) updateFields.is_active = is_active;

    const setClause = Object.keys(updateFields).map(field => `${field} = ?`).join(', ');
    await db.query(
      `UPDATE Coupon SET ${setClause} WHERE coupon_id = ?`,
      [...Object.values(updateFields), id]
    );

    res.status(200).json({ success: true, message: 'Coupon updated successfully!' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete coupon (Admin only)
// @route   DELETE /api/coupons/:id
// @access  Admin
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin.id;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Coupon ID is required.' });
    }

    const [result] = await db.query('DELETE FROM Coupon WHERE coupon_id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    res.status(200).json({ success: true, message: 'Coupon deleted successfully!' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons/admin/all
// @access  Admin
const getAllCoupons = async (req, res) => {
  try {
    const [coupons] = await db.query(
      `SELECT c.*, 
             COUNT(cu.usage_id) as usage_count 
       FROM Coupon c 
       LEFT JOIN Coupon_Usage cu ON c.coupon_id = cu.coupon_id 
       WHERE 1 = 1 
       GROUP BY c.coupon_id`
    );

    res.status(200).json({ 
      success: true, 
      coupons: coupons.map(coupon => ({
        ...coupon,
        usage_count: coupon.usage_count || 0
      }))
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  validateCoupon,
  getActiveCoupons,
  getEligibleCoupons,
  applyCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupons
};
