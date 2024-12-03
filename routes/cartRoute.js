const express = require('express');
const router = express.Router();
const { viewCart, viewPaidCart, addProductToCart, updateCartStatus, deleteCartItem } = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/authMiddleware');

// View cart
router.get('/', authenticateToken, viewCart);

// Add product to cart
router.post('/add', authenticateToken, addProductToCart);

// Update cart item status
router.put('/update-status', authenticateToken, updateCartStatus);

// View paid cart
router.get('/paid', authenticateToken, viewPaidCart);

// Delete cart item
router.delete('/delete/:cartItemId', authenticateToken, deleteCartItem);

module.exports = router; 