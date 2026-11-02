/**
 * Product Controller
 * Menangani kebutuhan response REST API dalam format JSON
 */

const productModel = require('../models/productModel');
const appConfig = require('../config/appConfig');

const productController = {
  /**
   * Menampilkan status ketersediaan backend API
   * Endpoint: GET /api/status
   */
  getStatus(req, res) {
    try {
      return res.status(200).json({
        success: true,
        message: 'Kebab Corner API is running',
        application: appConfig.appName,
        status: 'OK'
      });
    } catch (error) {
      console.error('Error pada getStatus API:', error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat memeriksa status API',
        error: error.message
      });
    }
  },

  /**
   * Mengambil seluruh data produk kebab
   * Endpoint: GET /api/produk
   */
  getProducts(req, res) {
    try {
      const products = productModel.getAllProducts();

      return res.status(200).json({
        success: true,
        message: 'Data produk berhasil diambil',
        total: products.length,
        data: products
      });
    } catch (error) {
      console.error('Error pada getProducts API:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data produk',
        error: error.message
      });
    }
  }
};

module.exports = productController;
