/**
 * Page Controller - NemuSnack
 * Mengatur alur request dan rendering halaman frontend (EJS)
 */

const productModel = require('../models/productModel');
const appConfig = require('../config/appConfig');
const formatCurrency = require('../utils/formatCurrency');

const pageController = {
  /**
   * Menampilkan halaman utama (Home)
   * Menyediakan data jajanan untuk hero, rekomendasi, featured card, dan live map tracking
   */
  getHomePage(req, res) {
    try {
      const allProducts = productModel.getAllProducts();
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
        errorMessage: 'Terjadi kesalahan internal pada server'
      });
    }
  },

  /**
   * Menampilkan halaman katalog jajanan & monitoring lapak
   * Menyediakan seluruh data produk, pencarian by ID, dan live route inspector
   */
  getMenuPage(req, res) {
    try {
      const products = productModel.getAllProducts();
      const requestedId = req.query.id ? parseInt(req.query.id, 10) : null;
      const selectedProduct = requestedId ? productModel.getProductById(requestedId) : null;

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
        errorMessage: 'Terjadi kesalahan internal pada server'
      });
    }
  }
};

module.exports = pageController;
