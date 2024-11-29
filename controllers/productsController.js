const db = require('../config/db');

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.product_id, 
                p.product_name, 
                p.price, 
                p.stock, 
                p.created_at, 
                p.img, 
                p.specs, 
                p.discount, 
                c.category_name
            FROM 
                products p
            LEFT JOIN 
                categories c ON p.category_id = c.category_id
        `;
        const [products] = await db.query(query);
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to retrieve products' });
    }
};

const getProductById = async (req, res) => {
    const productId = req.params.id;
    const query = `SELECT * FROM products WHERE product_id = ?`;
    const [product] = await db.query(query, [productId]);
    res.status(200).json({ success: true, data: product });
};

const getProductsByCategory = async (req, res) => {
    const categoryName = req.params.category;
    try {
        const query = `
            SELECT 
                p.product_id, 
                p.product_name, 
                p.price, 
                p.stock, 
                p.created_at, 
                p.img, 
                p.specs, 
                p.discount, 
                c.category_name
            FROM 
                products p
            LEFT JOIN 
                categories c ON p.category_id = c.category_id
            WHERE 
                c.category_name = ?
        `;
        const [products] = await db.query(query, [categoryName]);
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to retrieve products by category' });
    }
};

module.exports = { getAllProducts, getProductById, getProductsByCategory };

