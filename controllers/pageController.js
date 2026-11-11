/**
 * Page Controller - NemuSnack
 * Mengatur alur request dan rendering halaman frontend (EJS)
 * Terhubung dengan database PostgreSQL via Model
 */

const productModel = require('../models/productModel');
const reviewModel = require('../models/reviewModel');
const appConfig = require('../config/appConfig');
const formatCurrency = require('../utils/formatCurrency');

const pageController = {
  /**
   * Menampilkan halaman utama (Home)
   * Menyediakan data jajanan untuk hero, rekomendasi, featured card, dan live map tracking
   */
  async getHomePage(req, res) {
    try {
      const allProducts = await productModel.getAllProducts();
      const featuredProducts = allProducts.slice(0, 3);

      res.render('pages/home', {
        title: `${appConfig.appName} - Jajanan Kaki Lima Favoritmu, Dilacak Real-Time`,
        appName: appConfig.appName,
        appTagline: appConfig.appTagline,
        products: allProducts,
        featuredProducts,
        formatCurrency,
        currentPath: '/'
      });
    } catch (error) {
      console.error('Error saat merender halaman utama:', error);
      res.status(500).render('errors/404', {
        title: 'Terjadi Kesalahan Server',
        appName: appConfig.appName,
        currentPath: '/',
        errorMessage: 'Terjadi kesalahan saat memuat data beranda dari database'
      });
    }
  },

  /**
   * Menampilkan halaman katalog jajanan & monitoring lapak
   * Menyediakan seluruh data produk dari database, pencarian by ID, dan live route inspector
   */
  async getMenuPage(req, res) {
    try {
      const products = await productModel.getAllProducts();
      const requestedId = req.query.id ? parseInt(req.query.id, 10) : null;
      const selectedProduct = requestedId ? await productModel.getProductById(requestedId) : null;

      res.render('pages/menu', {
        title: `Katalog Jajanan & Status Lapak - ${appConfig.appName}`,
        appName: appConfig.appName,
        appTagline: appConfig.appTagline,
        products,
        formatCurrency,
        currentPath: '/menu',
        requestedId,
        selectedProduct
      });
    } catch (error) {
      console.error('Error saat merender halaman menu:', error);
      res.status(500).render('errors/404', {
        title: 'Terjadi Kesalahan Server',
        appName: appConfig.appName,
        currentPath: '/menu',
        errorMessage: 'Terjadi kesalahan saat memuat katalog jajanan dari database'
      });
    }
  },

  /**
   * Menampilkan halaman detail produk jajanan dan ulasan/rating
   */
  async getProductDetailPage(req, res) {
    try {
      const { id } = req.params;
      const product = await productModel.getProductById(id);

      if (!product) {
        return res.status(404).render('errors/404', {
          title: 'Produk Tidak Ditemukan',
          appName: appConfig.appName,
          currentPath: req.path,
          errorMessage: `Produk jajanan dengan ID ${id} tidak ditemukan di database`
        });
      }

      const reviews = await reviewModel.getByProductId(id);

      res.render('pages/product-detail', {
        title: `${product.name} - ${appConfig.appName}`,
        appName: appConfig.appName,
        currentPath: '/menu',
        product,
        reviews,
        formatCurrency,
        msg: req.query.msg || null,
        error: req.query.error || null
      });
    } catch (error) {
      console.error('Error saat merender halaman detail produk:', error);
      res.status(500).render('errors/404', {
        title: 'Terjadi Kesalahan Server',
        appName: appConfig.appName,
        currentPath: req.path,
        errorMessage: 'Terjadi kesalahan saat mengambil detail jajanan'
      });
    }
  },

  /**
   * Mengirim ulasan dan rating untuk produk (Khusus Pembeli / User Login)
   */
  async submitReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      if (!req.session || !req.session.user) {
        return res.redirect(`/login?redirect=/produk/${id}`);
      }

      if (!rating || !comment) {
        return res.redirect(`/produk/${id}?error=Rating+dan+komentar+ulasan+wajib+diisi`);
      }

      await reviewModel.createReview({
        productId: id,
        userId: req.session.user.id,
        rating: parseInt(rating, 10),
        comment
      });

      res.redirect(`/produk/${id}?msg=Terima+kasih!+Ulasan+Anda+berhasil+ditambahkan`);
    } catch (error) {
      console.error('Error saat submit ulasan:', error);
      res.redirect(`/produk/${req.params.id}?error=Gagal+mengirim+ulasan`);
    }
  }
};

module.exports = pageController;
