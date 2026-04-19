const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { placeOrder, getOrderHistory, getOrderById, cancelOrder } = require('../controllers/orderController');

router.post('/', protect, placeOrder);
router.get('/', protect, getOrderHistory);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
