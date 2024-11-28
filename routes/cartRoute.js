const express = require('express');
const router = express.Router();
const { viewCart, addProductToCart } = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/authMiddleware');

// View cart
router.get('/', authenticateToken, viewCart);

// Add product to cart
router.post('/add', authenticateToken, addProductToCart);

module.exports = router; 