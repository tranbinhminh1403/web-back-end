const express = require('express');
const router = express.Router();
const { viewCart, viewPaidCart, addProductToCart, updateCartStatus, deleteCartItem, getUserCartWithItems, getTotalPaidCartItems } = require('../controllers/cartController');
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

// Get user cart with items
router.get('/admin/user-cart', authenticateToken, getUserCartWithItems);

// Get total paid cart items for admin
router.get('/admin/total-paid-items', authenticateToken, getTotalPaidCartItems);

module.exports = router; 