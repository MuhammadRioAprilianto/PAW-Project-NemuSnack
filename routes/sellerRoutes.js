/**
 * Route Khusus Penjual / Pedagang - NemuSnack
 * Dilindungi oleh authMiddleware.isPenjual
 */

const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const authMiddleware = require('../middlewares/authMiddleware');

// Proteksi seluruh route pedagang
router.use(authMiddleware.isPenjual);

// Dashboard Pedagang
router.get('/dashboard', sellerController.getDashboard);

// Update Status Bekerja & Posisi Lapak
router.post('/status-location', sellerController.updateStatusLocation);

// Tambah Produk Baru
router.post('/products', sellerController.createProduct);

// Halaman Edit Produk
router.get('/products/:id/edit', sellerController.getEditProductPage);

// Simpan Update Produk
router.post('/products/:id/edit', sellerController.updateProduct);

// Hapus Produk
router.post('/products/:id/delete', sellerController.deleteProduct);

module.exports = router;
