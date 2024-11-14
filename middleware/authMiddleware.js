const jwt = require('jsonwebtoken');

// Middleware to authenticate the token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // If there is no token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // If token is not valid

        req.user = user; // Save the user info in the request
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = { authenticateToken };