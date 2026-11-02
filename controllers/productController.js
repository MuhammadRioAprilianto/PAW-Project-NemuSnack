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
  },

  /**
   * Mengambil data satu produk berdasarkan ID
   * Endpoint: GET /api/produk/:id
   */
  getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = productModel.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Produk dengan ID ${id} tidak ditemukan`,
          data: null
        });
      }

      return res.status(200).json({
        success: true,
        message: `Data produk ${product.name} (ID: ${id}) berhasil diambil`,
        data: product
      });
    } catch (error) {
      console.error('Error pada getProductById API:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data produk berdasarkan ID',
        error: error.message
      });
    }
  }
};

module.exports = productController;
