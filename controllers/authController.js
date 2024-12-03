const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// register a new user
const registerUser = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Check if the user already exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);

        if (existingUser.length > 0) {
            return res.status(400).send({
                success: false,
                message: 'Username or email already exists',
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database with role "user"
        await db.query('INSERT INTO users (username, password, email, role, created_at) VALUES (?, ?, ?, ?, NOW())', [username, hashedPassword, email, 'user']);

        res.status(201).send({
            success: true,
            message: 'User registered successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'User registration failed',
            error,
        });
    }
};

// login a user
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the user exists
        const [user] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (user.length === 0) {
            return res.status(401).send({
                success: false,
                message: 'Invalid username or password',
            });
        }

        const existingUser = user[0];

        // Check if the password is correct
        const validPassword = await bcrypt.compare(password, existingUser.password);

        if (!validPassword) {
            return res.status(401).send({
                success: false,
                message: 'Invalid username or password',
            });
        }

        // Generate a JWT token
        const token = jwt.sign(
            {
                id: existingUser.user_id,
                username: existingUser.username,
                role: existingUser.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Log the token in the console
        console.log('JWT Token:', token);

        res.status(200).send({
            success: true,
            message: 'User logged in successfully',
            token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'User login failed',
            error,
        });
    }
};

// Update user info
const updateUserInfo = async (req, res) => {
    const { userId, email, newPassword, address, phone } = req.body;

    try {
        // Check if the user exists
        const [user] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);

        if (user.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'User not found',
            });
        }

        if (address) {
            await db.query('UPDATE users SET address = ?, updated_at = NOW() WHERE user_id = ?', [address, userId]);
        }

        if (phone) {
            await db.query('UPDATE users SET phone = ?, updated_at = NOW() WHERE user_id = ?', [phone, userId]);
        }

        // Update email if provided
        if (email) {
            await db.query('UPDATE users SET email = ?, updated_at = NOW() WHERE user_id = ?', [email, userId]);
        }

        // Update password if provided
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            console.log('Hashed Password:', hashedPassword);
            await db.query('UPDATE users SET password = ?, updated_at = NOW() WHERE user_id = ?', [hashedPassword, userId]);
        }

        res.status(200).send({
            success: true,
            message: 'User info updated successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Failed to update user info',
            error,
        });
    }
};


const getUser = async (req, res) => {
    const userId = req.user.id; // Get the user ID from the JWT payload

    try {
        // Retrieve the user info from the database
        const [user] = await db.query('SELECT username, email, address, phone FROM users WHERE user_id = ?', [userId]);

        if (user.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'User not found',
            });
        }

        res.status(200).send({
            success: true,
            data: user[0],
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Failed to retrieve user info',
            error,
        });
    }
};

// User logout
const logoutUser = (req, res) => {
    // Simply return a success message; token can be handled on the client side
    res.status(200).send({ success: true, message: 'Logout successful' });
};

const getAllUsers = async (req, res) => {
    try {
        console.log('User role:', req.user.role);
        if (req.user.role !== 'admin') {
            return res.status(403).send({
                success: false,
                message: 'Access denied. Admins only.',
            });
        }

        const [users] = await db.query('SELECT user_id, username, email, role FROM users');
        res.status(200).send({
            success: true,
            data: users,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Failed to retrieve users',
            error,
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        // Check if the user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).send({
                success: false,
                message: 'Access denied. Admins only.',
            });
        }

        const { userId } = req.params;

        // Check if the user exists
        const [user] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);

        if (user.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'User not found',
            });
        }

        // Delete the user
        await db.query('DELETE FROM users WHERE user_id = ?', [userId]);

        res.status(200).send({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: 'Failed to delete user',
            error,
        });
    }
};

module.exports = { registerUser, loginUser, logoutUser, updateUserInfo, getUser, getAllUsers, deleteUser };