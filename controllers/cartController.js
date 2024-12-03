const db = require('../config/db');

// View cart
const viewCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT ci.cart_item_id, ci.quantity, ci.status, p.product_id, p.product_name,p.discount, p.price, p.img
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.product_id
            WHERE ci.cart_id = (SELECT cart_id FROM carts WHERE user_id = ?) AND ci.status = 0
        `;
        const [cartItems] = await db.query(query, [userId]);

        if (cartItems.length === 0) {
            return res.status(404).json({ message: 'Cart not found or all items are paid' });
        }

        res.json({ success: true, data: cartItems });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const viewPaidCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT ci.cart_item_id, ci.quantity, ci.status, p.product_id, p.product_name,p.discount, p.price, p.img
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.product_id
            WHERE ci.cart_id = (SELECT cart_id FROM carts WHERE user_id = ?) AND ci.status = 1
        `;
        const [cartItems] = await db.query(query, [userId]);

        if (cartItems.length === 0) {
            return res.status(404).json({ message: 'Cart not found or all items are not paid' });
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

        // Check if the product is already in the cart and not paid
        let [cartItem] = await db.query('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ? AND status = 0', [cart.cart_id, productId]);

        if (cartItem.length > 0) {
            // Update the quantity if the product is already in the cart and not paid
            await db.query('UPDATE cart_items SET quantity = quantity + ? WHERE cart_item_id = ?', [quantity, cartItem[0].cart_item_id]);
        } else {
            // Add the product to the cart with status 0 (not paid)
            await db.query('INSERT INTO cart_items (cart_id, product_id, quantity, status) VALUES (?, ?, ?, 0)', [cart.cart_id, productId, quantity]);
        }

        res.json({ message: 'Product added to cart' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Update cart item status
const updateCartStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        // Update all cart items for the user that are not yet paid (status != 1)
        const query = `
            UPDATE cart_items
            SET status = 1
            WHERE cart_id = (SELECT cart_id FROM carts WHERE user_id = ?) AND status != 1
        `;
        const [result] = await db.query(query, [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No cart items found to update' });
        }

        res.json({ message: 'All cart items updated to paid status successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { cartItemId } = req.params;

        // Check if the cart item belongs to the user
        const query = `
            SELECT ci.cart_item_id
            FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.cart_id
            WHERE ci.cart_item_id = ? AND c.user_id = ?
        `;
        const [cartItem] = await db.query(query, [cartItemId, userId]);

        if (cartItem.length === 0) {
            return res.status(404).json({ message: 'Cart item not found or does not belong to the user' });
        }

        // Delete the cart item
        await db.query('DELETE FROM cart_items WHERE cart_item_id = ?', [cartItemId]);

        res.json({ message: 'Cart item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getUserCartWithItems = async (req, res) => {
    try {
        const userId = req.user.id;

        const query = `
            SELECT 
                c.cart_id, 
                ci.cart_item_id, 
                ci.quantity, 
                ci.status, 
                p.product_id, 
                p.product_name, 
                p.price, 
                p.img
            FROM 
                carts c
            LEFT JOIN 
                cart_items ci ON c.cart_id = ci.cart_id
            LEFT JOIN 
                products p ON ci.product_id = p.product_id
            WHERE 
                c.user_id = ?
        `;
        const [cartWithItems] = await db.query(query, [userId]);

        if (cartWithItems.length === 0) {
            return res.status(404).json({ message: 'No cart found for this user' });
        }

        res.status(200).json({ success: true, data: cartWithItems });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

const getTotalPaidCartItems = async (req, res) => {
    try {
        // Check if the user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const query = `
            SELECT 
                p.product_id,
                p.product_name,
                SUM(ci.quantity) AS totalQuantitySold,
                p.price,
                p.discount,
                c.category_name
            FROM 
                cart_items ci
            JOIN 
                products p ON ci.product_id = p.product_id
            LEFT JOIN 
                categories c ON p.category_id = c.category_id
            WHERE 
                ci.status = 1
            GROUP BY 
                p.product_id, p.product_name, p.price, p.discount, c.category_name
        `;
        const [result] = await db.query(query);

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { viewCart, viewPaidCart, addProductToCart, updateCartStatus, deleteCartItem, getUserCartWithItems, getTotalPaidCartItems };
