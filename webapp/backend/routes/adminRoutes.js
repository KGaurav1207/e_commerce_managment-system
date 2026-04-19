const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/auth');
const { getDashboardStats, getAllUsers, getAllOrders, updateOrderStatus, getInventory, updateInventory, getSuppliers } = require('../controllers/adminController');

router.get('/dashboard', adminProtect, getDashboardStats);
router.get('/users', adminProtect, getAllUsers);
router.get('/orders', adminProtect, getAllOrders);
router.put('/orders/:id/status', adminProtect, updateOrderStatus);
router.get('/inventory', adminProtect, getInventory);
router.put('/inventory/:productId', adminProtect, updateInventory);
router.get('/suppliers', adminProtect, getSuppliers);

module.exports = router;
