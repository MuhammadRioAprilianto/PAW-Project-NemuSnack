/**
 * Route Halaman Frontend
 * Menghubungkan endpoint URL dengan Page Controller
 */

const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

// Halaman Beranda (Home)
router.get('/', pageController.getHomePage);

// Halaman Daftar Menu
router.get('/menu', pageController.getMenuPage);

module.exports = router;
