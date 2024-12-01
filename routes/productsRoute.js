const express = require('express');
const { getAllProducts, getProductById, getProductsByCategory, filterProducts } = require('../controllers/productsController');

//router obj
const router = express.Router();

//get all products
router.get('/list', getAllProducts);

// Get a specific product by ID
router.get('/detail/:id', getProductById);

// // Search products
// router.get('/search', searchProducts);

router.get('/list/:category', getProductsByCategory);

router.get('/filter', filterProducts);

module.exports = router;