/**
 * Page Controller - NemuSnack
 * Mengatur alur request dan rendering halaman frontend (EJS)
 * Berdasarkan tema PRD NemuSnack (Muhammad Rio Aprilianto - 20240140204)
 */

const productModel = require('../models/productModel');
const appConfig = require('../config/appConfig');
const formatCurrency = require('../utils/formatCurrency');

const pageController = {
  /**
   * Menampilkan halaman utama (Home)
   * Menampilkan hero NemuSnack, rekomendasi AI, preview lapak PKL, dan persona Salsa & Pak Yono
   */
  getHomePage(req, res) {
    try {
      const allProducts = productModel.getAllProducts();
      // Mengambil 3 produk unggulan pertama untuk halaman home
      const featuredProducts = allProducts.slice(0, 3);

      res.render('pages/home', {
        title: `${appConfig.appName} - Temukan Jajanan Kaki Lima & PKL Terdekat`,
        appName: appConfig.appName,
        appTagline: appConfig.appTagline,
        author: appConfig.author,
        nim: appConfig.nim,
        version: appConfig.version,
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
        author: appConfig.author,
        nim: appConfig.nim,
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
