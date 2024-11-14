const express = require('express');
const { registerUser, loginUser, logoutUser, updateUserInfo, getUser } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Register a new user
router.post('/register', registerUser);

// Login a user
router.post('/login', loginUser);

// Logout a user
router.post('/logout', logoutUser);

// Update user info
router.post('/update-info', authenticateToken, updateUserInfo);

// Get user info
router.get('/get-user', authenticateToken, getUser);

module.exports = router;