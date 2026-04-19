const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { processPayment, getPaymentStatus, generateReceipt, generateAdminReceipt } = require('../controllers/paymentController');

// @route   POST /api/payments/process
// @desc    Process payment for an order
// @access  Private
router.post('/process', protect, processPayment);

// @route   GET /api/payments/status/:transactionId
// @desc    Get payment status
// @access  Private
router.get('/status/:transactionId', protect, getPaymentStatus);

// @route   GET /api/payments/receipt/:orderId
// @desc    Generate receipt for an order
// @access  Private
router.get('/receipt/:orderId', protect, generateReceipt);

// @route   GET /api/payments/admin/receipt/:orderId
// @desc    Generate receipt for any order (admin only)
// @access  Private (Admin only)
router.get('/admin/receipt/:orderId', protect, generateAdminReceipt);

module.exports = router;
