const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/auth');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getAllCategories, createCategory } = require('../controllers/productController');

// Products
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', adminProtect, createProduct);
router.put('/:id', adminProtect, updateProduct);
router.delete('/:id', adminProtect, deleteProduct);

module.exports = router;
