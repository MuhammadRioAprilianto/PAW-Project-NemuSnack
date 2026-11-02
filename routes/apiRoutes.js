/**
 * Route REST API
 * Menghubungkan endpoint API dengan Product Controller
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Endpoint status ketersediaan API -> GET /api/status
router.get('/status', productController.getStatus);

// Endpoint data produk kebab -> GET /api/produk
router.get('/produk', productController.getProducts);

module.exports = router;
