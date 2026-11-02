/**
 * Product Controller - NemuSnack
 * Menangani kebutuhan REST API JSON untuk katalog jajanan kaki lima,
 * status server, pencarian by ID, serta asisten rekomendasi kuliner.
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
        message: 'NemuSnack API is running',
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
   * Mengambil seluruh data katalog jajanan PKL
   * Endpoint: GET /api/produk
   */
  getProducts(req, res) {
    try {
      const products = productModel.getAllProducts();

      return res.status(200).json({
        success: true,
        message: 'Data katalog jajanan PKL NemuSnack berhasil diambil',
        total: products.length,
        data: products
      });
    } catch (error) {
      console.error('Error pada getProducts API:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data produk jajanan',
        error: error.message
      });
    }
  },

  /**
   * Mengambil data satu produk jajanan berdasarkan ID
   * Endpoint: GET /api/produk/:id
   */
  getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = productModel.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Jajanan dengan ID ${id} tidak ditemukan`,
          data: null
        });
      }

      return res.status(200).json({
        success: true,
        message: `Data jajanan ${product.name} (ID: ${id}) dari ${product.seller} berhasil diambil`,
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
  },

  /**
   * Asisten Rekomendasi Jajanan
   * Memberikan rekomendasi jajanan berbasis selera, budget, atau kata kunci
   * Endpoint: GET /api/rekomendasi?q=...
   */
  getAiRecommendation(req, res) {
    try {
      const query = (req.query.q || '').trim();
      const allProducts = productModel.getAllProducts();

      if (!query) {
        return res.status(200).json({
          success: true,
          message: 'Silakan masukkan preferensi jajanan (contoh: pedas, manis, murah, gurih)',
          recommendations: allProducts.slice(0, 3)
        });
      }

      let matches = productModel.searchProducts(query);
      
      // Filter 'murah' -> harga <= 12000
      if (query.toLowerCase().includes('murah')) {
        matches = allProducts.filter(p => p.price <= 12000);
      }

      // Default jika tidak ada yang spesifik
      if (matches.length === 0) {
        matches = allProducts.slice(0, 2);
      }

      return res.status(200).json({
        success: true,
        query: query,
        message: `Ditemukan ${matches.length} rekomendasi jajanan untuk pencarian "${query}"`,
        recommendations: matches
      });
    } catch (error) {
      console.error('Error pada getAiRecommendation API:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal memproses rekomendasi',
        error: error.message
      });
    }
  }
};

module.exports = productController;
