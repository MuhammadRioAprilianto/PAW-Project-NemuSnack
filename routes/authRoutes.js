/**
 * Route Autentikasi Pengguna - NemuSnack
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Halaman Login & Proses
router.get('/login', authController.getLoginPage);
router.post('/login', authController.handleLogin);

// Halaman Register & Proses
router.get('/register', authController.getRegisterPage);
router.post('/register', authController.handleRegister);

// Logout
router.get('/logout', authController.handleLogout);
router.post('/logout', authController.handleLogout);

module.exports = router;
