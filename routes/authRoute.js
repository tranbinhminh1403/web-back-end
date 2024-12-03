const express = require('express');
const { registerUser, loginUser, logoutUser, updateUserInfo, getUser, getAllUsers, deleteUser } = require('../controllers/authController');
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

// Get all users
router.get('/admin/all-users', authenticateToken, getAllUsers);

// Delete a user
router.delete('/admin/delete-user/:userId', authenticateToken, deleteUser);

module.exports = router;