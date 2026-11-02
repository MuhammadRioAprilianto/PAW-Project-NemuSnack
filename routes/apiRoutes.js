/**
 * Route REST API - NemuSnack
 * Menghubungkan endpoint API dengan Product Controller
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Endpoint status ketersediaan API -> GET /api/status
router.get('/status', productController.getStatus);

// Endpoint data seluruh katalog jajanan -> GET /api/produk
router.get('/produk', productController.getProducts);

// Endpoint data satu produk jajanan berdasarkan ID -> GET /api/produk/:id
router.get('/produk/:id', productController.getProductById);

// Endpoint rekomendasi AI jajanan (F-01 PRD) -> GET /api/rekomendasi
router.get('/rekomendasi', productController.getAiRecommendation);

module.exports = router;
