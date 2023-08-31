const db = require('../database/mySQL.js')
const fs = require('fs')
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '../frontend/seller/Assets');
    },
    filename: (req, file, cb) => {
      const filename = Date.now() + path.extname(file.originalname);
      cb(null, filename);
    }
});
  
const upload = multer({ storage });

async function create_product(req, res) {
    console.log(req.body);
    const { title, description, price, category, length, width, height } = req.body;
    const image = req.file ? req.file.filename : undefined;

    const query = `
        INSERT INTO products (title, description, price, category, length, width, height, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const values = [title, description, price, category, length, width, height, image];
    
    db.query(query, values, async (err, result) => {
        if (err) {
            console.error('Error creating product:', err);
            res.status(500).json({ error: 'Error creating product' });
        } else {
            res.status(201).json({ message: 'Product created successfully', productId: result.insertId });
        }
    });
}

async function update_product(req, res) {
    const productId = req.params.id;
    const { title, description, price, category, length, width, height } = req.body;

    // Check if a new image is provided
    const newImage = req.file ? req.file.filename : undefined;

    const query = `
        UPDATE products
        SET products.title = ?, products.description = ?, products.price = ?, products.category = ?, products.length = ?, products.width = ?, products.height = ? ${newImage !== undefined ? ', products.image = ?' : ''}
        WHERE products.id = ?;
    `;

    const values = [title, description, price, category, length, width, height];
    if (newImage !== undefined) {
        values.push(newImage);
    }
    values.push(productId);

    db.query(query, values, async (err, result) => {
        if (err) {
            console.error('Error updating product:', err);
            res.status(500).json({ error: 'Error updating product' });
        } else {
            res.status(200).json({ message: 'Product updated successfully' });
        }
    });
}

async function delete_product(req, res) {
    const productId = req.params.id;
    const getImageQuery = `SELECT image FROM products WHERE id = ?`;
    db.query(getImageQuery, [productId], async (err, result) => {
        if (err) {
            console.error('Error retrieving image filename:', err);
            res.status(500).json({ error: 'Error deleting product' });
            return;
        }

        if (result.length === 0) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }

        const imageFilename = result[0].image;

        const deleteProductQuery = `DELETE FROM products WHERE id = ?`;
        db.query(deleteProductQuery, [productId], async (err, result) => {
            if (err) {
                console.error('Error deleting product:', err);
                res.status(500).json({ error: 'Error deleting product' });
            } else {
                // Delete the image file from the folder
                const imagePath = path.join('../Mysql-Mongo/frontend/seller/Assets', imageFilename);
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error('Error deleting image file:', err);
                    }
                });

                res.status(200).json({ message: 'Product and image deleted successfully' });
            }
        });
    });
}

async function get_product(req, res) {
    const productId = req.params.id;
    const query = `SELECT * FROM products WHERE id = ?`;
    
    db.query(query, [productId], async (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            res.status(500).json({ error: 'Error fetching product' });
        } else {
            if (results.length === 0) {
                res.status(404).json({ error: 'Product not found' });
            } else {
                const product = results[0];
                res.status(200).json(product);
            }
        }
    });
}

async function get_all_products(req, res) {
    const query = `SELECT id, title, description, price, image FROM products`;

    db.query(query, async (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).json({ error: 'Error fetching products' });
        } else {
            res.status(200).json(results);
        }
    });
}

module.exports = {
    create_product,
    update_product,
    delete_product,
    get_product,
    get_all_products
};