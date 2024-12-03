const express = require('express');
const { getAllProducts, getProductById, getProductsByCategory, filterProducts, addProduct, deleteProduct, updateProduct } = require('../controllers/productsController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all products
router.get('/list', getAllProducts);

// Get a specific product by ID
router.get('/detail/:id', getProductById);

// Get products by category
router.get('/list/:category', getProductsByCategory);

// Filter products
router.get('/filter', filterProducts);

// Add a new product
router.post('/admin/add', authenticateToken, addProduct);

// Delete a product
router.delete('/admin/delete/:productId', authenticateToken, deleteProduct);

// Update a product
router.put('/admin/update/:productId', authenticateToken, updateProduct);

module.exports = router;