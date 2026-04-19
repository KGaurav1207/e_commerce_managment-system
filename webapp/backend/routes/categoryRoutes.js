const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/auth');
const { getAllCategories, createCategory } = require('../controllers/productController');

router.get('/', getAllCategories);
router.post('/', adminProtect, createCategory);

module.exports = router;
