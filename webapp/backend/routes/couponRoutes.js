// ============================================================
// Coupon Routes
// ============================================================
const express = require('express');
const router = express.Router();
const { protect, adminProtect } = require('../middleware/auth');
const { validateCoupon, getActiveCoupons, getEligibleCoupons, applyCoupon, createCoupon, updateCoupon, deleteCoupon, getAllCoupons } = require('../controllers/couponController');

// Public route - get active coupons
router.get('/', getActiveCoupons);

// Admin-only routes (must come before /:id to avoid "all" matching as an ID)
router.get('/admin/all', adminProtect, getAllCoupons);
router.post('/', adminProtect, createCoupon);
router.put('/:id', adminProtect, updateCoupon);
router.delete('/:id', adminProtect, deleteCoupon);

// Protected user routes
router.get('/eligible', protect, getEligibleCoupons);
router.post('/validate', protect, validateCoupon);
router.post('/apply', protect, applyCoupon);

module.exports = router;
