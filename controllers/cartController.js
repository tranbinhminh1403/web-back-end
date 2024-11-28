const db = require('../config/db');

// View cart
const viewCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT ci.cart_item_id, ci.quantity, p.product_id, p.product_name, p.price, p.img
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.product_id
            WHERE ci.cart_id = (SELECT cart_id FROM carts WHERE user_id = ?)
        `;
        const [cartItems] = await db.query(query, [userId]);

        if (cartItems.length === 0) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.json({ success: true, data: cartItems });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Add product to cart
const addProductToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        // Check if the user has a cart
        let [cart] = await db.query('SELECT cart_id FROM carts WHERE user_id = ?', [userId]);

        if (cart.length === 0) {
            // Create a new cart if it doesn't exist
            const [result] = await db.query('INSERT INTO carts (user_id, created_at) VALUES (?, NOW())', [userId]);
            cart = { cart_id: result.insertId };
        } else {
            cart = cart[0];
        }

        // Check if the product is already in the cart
        let [cartItem] = await db.query('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?', [cart.cart_id, productId]);

        if (cartItem.length > 0) {
            // Update the quantity if the product is already in the cart
            await db.query('UPDATE cart_items SET quantity = quantity + ? WHERE cart_item_id = ?', [quantity, cartItem[0].cart_item_id]);
        } else {
            // Add the product to the cart
            await db.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [cart.cart_id, productId, quantity]);
        }

        res.json({ message: 'Product added to cart' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { viewCart, addProductToCart };
