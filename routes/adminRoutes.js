/**
 * Route Khusus Admin - NemuSnack
 * Dilindungi oleh authMiddleware.isAdmin
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

// Proteksi seluruh route admin
router.use(authMiddleware.isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Update Role User
router.post('/users/:id/role', adminController.updateUserRole);

// Delete User
router.post('/users/:id/delete', adminController.deleteUser);

// Moderasi Hapus Produk
router.post('/products/:id/delete', adminController.deleteProduct);

module.exports = router;
