/**
 * Page Controller
 * Mengatur alur request dan rendering halaman frontend (EJS)
 */

const productModel = require('../models/productModel');
const appConfig = require('../config/appConfig');
const formatCurrency = require('../utils/formatCurrency');

const pageController = {
  /**
   * Menampilkan halaman utama (Home)
   * Menyediakan 3 produk unggulan dari model
   */
  getHomePage(req, res) {
    try {
      const allProducts = productModel.getAllProducts();
      // Mengambil 3 produk unggulan pertama untuk halaman home
      const featuredProducts = allProducts.slice(0, 3);

      res.render('pages/home', {
        title: `${appConfig.appName} - Cita Rasa Kebab Autentik & Fresh`,
        appName: appConfig.appName,
        appTagline: appConfig.appTagline,
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
   * Menampilkan halaman menu
   * Menyediakan seluruh data produk dari model, serta mendukung query pencarian by ID
   */
  getMenuPage(req, res) {
    try {
      const products = productModel.getAllProducts();
      const requestedId = req.query.id ? parseInt(req.query.id, 10) : null;
      const selectedProduct = requestedId ? productModel.getProductById(requestedId) : null;

      res.render('pages/menu', {
        title: `Menu Kebab - ${appConfig.appName}`,
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
