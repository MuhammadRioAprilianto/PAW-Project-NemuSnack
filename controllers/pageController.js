/**
 * Page Controller - NemuSnack
 * Mengatur alur request dan rendering halaman frontend (EJS)
 * Terhubung dengan database PostgreSQL via Model
 */

const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
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
      const activeSellers = await userModel.getActiveSellersForMap();
      const featuredProducts = allProducts.slice(0, 3);

      res.render('pages/home', {
        title: `${appConfig.appName} - Jajanan Kaki Lima Favoritmu, Dilacak Real-Time`,
        appName: appConfig.appName,
        appTagline: appConfig.appTagline,
        products: allProducts,
        activeSellers,
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

  async getSellerDirectoryPage(req, res) {
    try {
      const sellers = await userModel.getAllSellers();
      const query = (req.query.q || '').trim();
      const normalizedQuery = query.toLowerCase();
      const filteredSellers = normalizedQuery
        ? sellers.filter(seller => [
            seller.name,
            seller.shop_name,
            seller.shop_description,
            seller.seller_location,
            ...(seller.categories || [])
          ].some(value => String(value || '').toLowerCase().includes(normalizedQuery)))
        : sellers;

      res.render('pages/sellers', {
        title: `Lapak / PKL - ${appConfig.appName}`,
        appName: appConfig.appName,
        sellers: filteredSellers,
        query,
        formatCurrency,
        currentPath: '/lapak'
      });
    } catch (error) {
      console.error('Error saat merender direktori lapak:', error);
      res.status(500).render('errors/404', {
        title: 'Terjadi Kesalahan Server',
        appName: appConfig.appName,
        currentPath: '/lapak',
        errorMessage: 'Terjadi kesalahan saat memuat daftar pedagang'
      });
    }
  },

  async getSellerDetailPage(req, res) {
    try {
      const seller = await userModel.getSellerById(req.params.id);
      if (!seller) {
        return res.status(404).render('errors/404', {
          title: 'Lapak Tidak Ditemukan',
          appName: appConfig.appName,
          currentPath: '/lapak',
          errorMessage: `Lapak dengan ID ${req.params.id} tidak ditemukan`
        });
      }

      const reviews = await reviewModel.getBySellerId(seller.id);
      res.render('pages/seller-detail', {
        title: `${seller.shop_name} - ${appConfig.appName}`,
        appName: appConfig.appName,
        currentPath: '/lapak',
        seller,
        reviews,
        formatCurrency
      });
    } catch (error) {
      console.error('Error saat merender detail lapak:', error);
      res.status(500).render('errors/404', {
        title: 'Terjadi Kesalahan Server',
        appName: appConfig.appName,
        currentPath: '/lapak',
        errorMessage: 'Terjadi kesalahan saat memuat profil pedagang'
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
      const seller = product.seller_id ? await userModel.getSellerById(product.seller_id) : null;

      res.render('pages/product-detail', {
        title: `${product.name} - ${appConfig.appName}`,
        appName: appConfig.appName,
        currentPath: '/menu',
        product,
        seller,
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

      const ratingValue = Number(rating);
      if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5 || typeof comment !== 'string' || !comment.trim()) {
        return res.redirect(`/produk/${id}?error=Rating+dan+komentar+ulasan+wajib+diisi`);
      }

      await reviewModel.createReview({
        productId: id,
        userId: req.session.user.id,
        rating: ratingValue,
        comment
      });

      res.redirect(`/produk/${id}?msg=Terima+kasih!+Ulasan+Anda+berhasil+ditambahkan`);
    } catch (error) {
      console.error('Error saat submit ulasan:', error);
      res.redirect(`/produk/${req.params.id}?error=Gagal+mengirim+ulasan`);
    }
  },

  /**
   * Menampilkan halaman khusus AI Assistant Chatbot
   */
  async getChatPage(req, res) {
    try {
      const allProducts = await productModel.getAllProducts();
      res.render('pages/chat', {
        title: `AI Assistant Chatbot - ${appConfig.appName}`,
        appName: appConfig.appName,
        appTagline: appConfig.appTagline,
        products: allProducts,
        currentPath: '/chat'
      });
    } catch (error) {
      console.error('Error saat merender halaman chat:', error);
      res.redirect('/#ai-assistant');
    }
  }
};

module.exports = pageController;
