/**
 * Route Halaman Frontend - NemuSnack
 * Menghubungkan endpoint URL dengan Page Controller
 */

const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

// Halaman Beranda (Home)
router.get('/', pageController.getHomePage);

// Halaman Daftar Menu & Lapak
router.get('/menu', pageController.getMenuPage);

// Direktori dan profil lapak/pedagang
router.get('/lapak', pageController.getSellerDirectoryPage);
router.get('/lapak/:id', pageController.getSellerDetailPage);

// Halaman Detail Produk & Ulasan
router.get('/produk/:id', pageController.getProductDetailPage);

// Halaman Khusus AI Assistant Chatbot
router.get('/chat', pageController.getChatPage);

// Kirim Ulasan Produk (Rating & Komentar)
router.post('/produk/:id/reviews', pageController.submitReview);

module.exports = router;
