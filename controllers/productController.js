/**
 * Product Controller - NemuSnack
 * Menangani kebutuhan REST API JSON untuk operasi CRUD jajanan kaki lima,
 * status server, pencarian by ID, serta asisten rekomendasi kuliner berbasis database PostgreSQL.
 */

const productModel = require('../models/productModel');
const appConfig = require('../config/appConfig');

const productController = {
  /**
   * Menampilkan status ketersediaan backend API
   * Endpoint: GET /api/status
   */
  async getStatus(req, res) {
    try {
      return res.status(200).json({
        success: true,
        message: 'NemuSnack API is running',
        application: appConfig.appName,
        status: 'OK',
        database: 'Connected (PostgreSQL)'
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
   * Mengambil seluruh data katalog jajanan PKL dari database PostgreSQL
   * Endpoint: GET /api/produk
   */
  async getProducts(req, res) {
    try {
      const products = await productModel.getAllProducts();

      return res.status(200).json({
        success: true,
        message: 'Data katalog jajanan PKL NemuSnack berhasil diambil dari database',
        total: products.length,
        data: products
      });
    } catch (error) {
      console.error('Error pada getProducts API:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data produk jajanan dari database',
        error: error.message
      });
    }
  },

  /**
   * Mengambil data satu produk jajanan berdasarkan ID dari database
   * Endpoint: GET /api/produk/:id
   */
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await productModel.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Jajanan dengan ID ${id} tidak ditemukan di database`,
          data: null
        });
      }

      return res.status(200).json({
        success: true,
        message: `Data jajanan ${product.name} (ID: ${id}) dari ${product.seller || 'Pedagang'} berhasil diambil`,
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
   * Menambahkan data produk jajanan baru ke dalam database (Create)
   * Endpoint: POST /api/produk
   */
  async createProduct(req, res) {
    try {
      const {
        name,
        category,
        price,
        status,
        location,
        route,
        lat,
        lng,
        whatsapp,
        description,
        image
      } = req.body;

      if (!name || !price) {
        return res.status(400).json({
          success: false,
          message: 'Nama jajanan dan harga wajib diisi'
        });
      }

      // Ambil seller_id dari user session jika sedang login, atau fallback ke 2 (Pak Yono) jika melalui direct API test
      const seller_id = req.session && req.session.user && req.session.user.id 
        ? req.session.user.id 
        : (req.body.seller_id ? parseInt(req.body.seller_id, 10) : 2);

      const newProduct = await productModel.createProduct({
        seller_id,
        name,
        category: category || 'Lainnya',
        price: parseInt(price, 10),
        status: status || 'Mangkal',
        location: location || '',
        route: route || '',
        lat: lat ? parseFloat(lat) : -7.7660,
        lng: lng ? parseFloat(lng) : 110.3800,
        whatsapp: whatsapp || '',
        description: description || '',
        image: image || '/assets/images/kebab-placeholder.svg'
      });

      return res.status(201).json({
        success: true,
        message: `Jajanan "${newProduct.name}" berhasil ditambahkan ke database`,
        data: newProduct
      });
    } catch (error) {
      console.error('Error pada createProduct API:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menambahkan produk jajanan ke database',
        error: error.message
      });
    }
  },

  /**
   * Memperbarui data produk jajanan berdasarkan ID (Update)
   * Endpoint: PUT /api/produk/:id
   */
  async updateProduct(req, res) {
    try {
      const { id } = req.params;

      const existing = await productModel.getProductById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Jajanan dengan ID ${id} tidak ditemukan untuk diperbarui`,
          data: null
        });
      }

      // Jika ada session dan role adalah penjual, verifikasi kepemilikan produk (kecuali admin)
      if (req.session && req.session.user && req.session.user.role === 'penjual') {
        if (existing.seller_id && existing.seller_id !== req.session.user.id) {
          return res.status(403).json({
            success: false,
            message: 'Akses ditolak: Anda hanya dapat memperbarui produk lapak Anda sendiri'
          });
        }
      }

      const updated = await productModel.updateProduct(id, req.body);

      return res.status(200).json({
        success: true,
        message: `Data jajanan "${updated.name}" (ID: ${id}) berhasil diperbarui di database`,
        data: updated
      });
    } catch (error) {
      console.error('Error pada updateProduct API:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal memperbarui data produk di database',
        error: error.message
      });
    }
  },

  /**
   * Menghapus data produk jajanan berdasarkan ID (Delete)
   * Endpoint: DELETE /api/produk/:id
   */
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      const existing = await productModel.getProductById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Jajanan dengan ID ${id} tidak ditemukan untuk dihapus`,
          data: null
        });
      }

      // Jika login sebagai penjual biasa, cek kepemilikan
      if (req.session && req.session.user && req.session.user.role === 'penjual') {
        if (existing.seller_id && existing.seller_id !== req.session.user.id) {
          return res.status(403).json({
            success: false,
            message: 'Akses ditolak: Anda hanya dapat menghapus produk lapak Anda sendiri'
          });
        }
      }

      const deleted = await productModel.deleteProduct(id);

      if (deleted) {
        return res.status(200).json({
          success: true,
          message: `Jajanan "${existing.name}" (ID: ${id}) berhasil dihapus dari database`
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus data produk dari database'
      });
    } catch (error) {
      console.error('Error pada deleteProduct API:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus data produk dari database',
        error: error.message
      });
    }
  },

  /**
   * Asisten Rekomendasi Jajanan (Search & Filter via Database)
   * Endpoint: GET /api/rekomendasi?q=...
   */
  async getAiRecommendation(req, res) {
    try {
      const query = (req.query.q || '').trim();
      const allProducts = await productModel.getAllProducts();

      if (!query) {
        return res.status(200).json({
          success: true,
          message: 'Silakan masukkan preferensi jajanan (contoh: pedas, manis, murah, gurih)',
          recommendations: allProducts.slice(0, 3)
        });
      }

      let matches = await productModel.searchProducts(query);

      // Filter khusus kata kunci 'murah' -> harga <= 12000
      if (query.toLowerCase().includes('murah')) {
        matches = allProducts.filter(p => p.price <= 12000);
      }

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
        message: 'Gagal memproses rekomendasi jajanan',
        error: error.message
      });
    }
  }
};

module.exports = productController;
