/**
 * Route REST API - NemuSnack
 * Menghubungkan endpoint REST API dengan Controller untuk operasi CRUD ke PostgreSQL
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const reviewModel = require('../models/reviewModel');
const logModel = require('../models/logModel');
const loggerMiddleware = require('../middlewares/loggerMiddleware');

// 1. Endpoint status ketersediaan API -> GET /api/status
router.get('/status', productController.getStatus);

// 2. Operasi CRUD Produk Jajanan (PostgreSQL)
// Read All -> GET /api/produk
router.get('/produk', productController.getProducts);

// Read Detail One -> GET /api/produk/:id
router.get('/produk/:id', productController.getProductById);

// Create -> POST /api/produk
router.post('/produk', productController.createProduct);

// Update -> PUT /api/produk/:id
router.put('/produk/:id', productController.updateProduct);

// Delete -> DELETE /api/produk/:id
router.delete('/produk/:id', productController.deleteProduct);

// 3. Endpoint Log Aktivitas Paling Akhir -> GET /api/logs/latest
router.get('/logs/latest', async (req, res) => {
  try {
    const memoryLog = loggerMiddleware.getLatestMemoryLog();
    if (memoryLog) {
      return res.status(200).json({
        success: true,
        source: 'memory',
        data: memoryLog
      });
    }
    const latestDb = await logModel.getLatestLog();
    return res.status(200).json({
      success: true,
      source: 'database',
      data: latestDb
    });
  } catch (error) {
    console.error('Error saat mengambil latest log:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil log terakhir',
      error: error.message
    });
  }
});

// 4. Endpoint Riwayat Activity Logs yang dicatat oleh Middleware Logger -> GET /api/logs
router.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const memoryLogs = loggerMiddleware.getMemoryLogs();
    
    if (memoryLogs && memoryLogs.length > 0) {
      return res.status(200).json({
        success: true,
        source: 'memory+database',
        message: 'Riwayat activity logs berhasil diambil',
        total: memoryLogs.length,
        data: memoryLogs.slice(0, limit)
      });
    }

    const logs = await logModel.getRecentLogs(limit);
    return res.status(200).json({
      success: true,
      source: 'database',
      message: 'Riwayat activity logs berhasil diambil dari database',
      total: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Error saat mengambil activity logs via API:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil riwayat activity logs',
      error: error.message
    });
  }
});

// 3. Endpoint Rekomendasi Jajanan (AI Assistant) -> GET /api/rekomendasi
router.get('/rekomendasi', productController.getAiRecommendation);

// 4. Endpoint Tambah Ulasan / Rating -> POST /api/produk/:id/reviews
router.post('/produk/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating (1-5) dan komentar ulasan wajib diisi'
      });
    }

    const userId = req.session && req.session.user ? req.session.user.id : 8; // fallback to Budi Santoso if testing via API directly

    const newReview = await reviewModel.createReview({
      productId: id,
      userId,
      rating: parseInt(rating, 10),
      comment
    });

    return res.status(201).json({
      success: true,
      message: 'Ulasan berhasil dikirim ke database',
      data: newReview
    });
  } catch (error) {
    console.error('Error saat submit review via API:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan ulasan',
      error: error.message
    });
  }
});

module.exports = router;
