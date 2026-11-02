/**
 * Route REST API
 * Menghubungkan endpoint API dengan Product Controller
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Endpoint status ketersediaan API -> GET /api/status
router.get('/status', productController.getStatus);

// Endpoint data seluruh produk kebab -> GET /api/produk
router.get('/produk', productController.getProducts);

// Endpoint data satu produk berdasarkan ID -> GET /api/produk/:id
router.get('/produk/:id', productController.getProductById);

module.exports = router;
