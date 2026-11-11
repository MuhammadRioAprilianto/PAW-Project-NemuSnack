/**
 * Seller Controller - NemuSnack
 * Mengatur operasional Penjual/Pedagang:
 * - Pengelolaan katalog produk lapak (CRUD)
 * - Pemantauan ulasan & rating dari pembeli
 * - Pengaturan status operasional (Mangkal, Berjalan, Tutup)
 * - Pembaruan koordinat GPS dan rute keliling pedagang
 */

const productModel = require('../models/productModel');
const reviewModel = require('../models/reviewModel');
const formatCurrency = require('../utils/formatCurrency');
const appConfig = require('../config/appConfig');

const sellerController = {
  /**
   * Menampilkan Dashboard Penjual
   */
  async getDashboard(req, res) {
    try {
      const sellerId = req.session.user.id;
      const products = await productModel.getProductsBySeller(sellerId);
      const reviews = await reviewModel.getBySellerId(sellerId);

      // Ambil status & lokasi pedagang dari produk pertama (jika ada)
      const currentCart = products.length > 0 ? products[0] : {
        status: 'Mangkal',
        location: 'Belum diatur',
        route: 'Belum diatur',
        lat: -7.7660,
        lng: 110.3800,
        whatsapp: req.session.user.phone || ''
      };

      res.render('pages/dashboard-penjual', {
        title: `Dashboard Pedagang - ${appConfig.appName}`,
        appName: appConfig.appName,
        currentPath: '/penjual/dashboard',
        seller: req.session.user,
        products,
        reviews,
        currentCart,
        formatCurrency,
        msg: req.query.msg || null,
        error: req.query.error || null
      });
    } catch (error) {
      console.error('Error saat memuat Dashboard Penjual:', error);
      res.status(500).render('errors/404', {
        title: '500 - Server Error',
        appName: appConfig.appName,
        currentPath: '/penjual/dashboard',
        errorMessage: 'Gagal memuat data Dashboard Pedagang'
      });
    }
  },

  /**
   * Menambah produk baru milik penjual (Form Action)
   */
  async createProduct(req, res) {
    try {
      const sellerId = req.session.user.id;
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
        return res.redirect('/penjual/dashboard?error=Nama+dan+harga+produk+wajib+diisi');
      }

      await productModel.createProduct({
        seller_id: sellerId,
        name,
        category: category || 'Lainnya',
        price: parseInt(price, 10),
        status: status || 'Mangkal',
        location: location || '',
        route: route || '',
        lat: lat ? parseFloat(lat) : -7.7660,
        lng: lng ? parseFloat(lng) : 110.3800,
        whatsapp: whatsapp || req.session.user.phone || '',
        description: description || '',
        image: image || '/assets/images/kebab-placeholder.svg'
      });

      res.redirect('/penjual/dashboard?msg=Produk+baru+berhasil+ditambahkan');
    } catch (error) {
      console.error('Error create product seller:', error);
      res.redirect('/penjual/dashboard?error=Gagal+menambahkan+produk');
    }
  },

  /**
   * Menampilkan halaman edit produk
   */
  async getEditProductPage(req, res) {
    try {
      const { id } = req.params;
      const product = await productModel.getProductById(id);

      if (!product) {
        return res.redirect('/penjual/dashboard?error=Produk+tidak+ditemukan');
      }

      // Pastikan produk milik penjual ini
      if (product.seller_id !== req.session.user.id && req.session.user.role !== 'admin') {
        return res.redirect('/penjual/dashboard?error=Akses+ditolak');
      }

      res.render('pages/product-edit', {
        title: `Edit Produk: ${product.name} - ${appConfig.appName}`,
        appName: appConfig.appName,
        currentPath: '/penjual/dashboard',
        product,
        error: req.query.error || null
      });
    } catch (error) {
      console.error('Error load edit page:', error);
      res.redirect('/penjual/dashboard?error=Gagal+memuat+halaman+edit');
    }
  },

  /**
   * Memperbarui produk milik penjual (Form Action)
   */
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productModel.getProductById(id);

      if (!product) {
        return res.redirect('/penjual/dashboard?error=Produk+tidak+ditemukan');
      }

      if (product.seller_id !== req.session.user.id && req.session.user.role !== 'admin') {
        return res.redirect('/penjual/dashboard?error=Akses+ditolak');
      }

      await productModel.updateProduct(id, req.body);
      res.redirect('/penjual/dashboard?msg=Produk+berhasil+diperbarui');
    } catch (error) {
      console.error('Error update product seller:', error);
      res.redirect(`/penjual/products/${req.params.id}/edit?error=Gagal+memperbarui+produk`);
    }
  },

  /**
   * Menghapus produk milik penjual (Form Action)
   */
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await productModel.getProductById(id);

      if (!product) {
        return res.redirect('/penjual/dashboard?error=Produk+tidak+ditemukan');
      }

      if (product.seller_id !== req.session.user.id && req.session.user.role !== 'admin') {
        return res.redirect('/penjual/dashboard?error=Akses+ditolak');
      }

      await productModel.deleteProduct(id);
      res.redirect('/penjual/dashboard?msg=Produk+berhasil+dihapus');
    } catch (error) {
      console.error('Error delete product seller:', error);
      res.redirect('/penjual/dashboard?error=Gagal+menghapus+produk');
    }
  },

  /**
   * Memperbarui status operasional dan koordinat posisi lapak
   */
  async updateStatusLocation(req, res) {
    try {
      const sellerId = req.session.user.id;
      const { status, location, route, lat, lng } = req.body;

      await productModel.updateSellerLocationAndStatus(sellerId, {
        status,
        location,
        route,
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined
      });

      res.redirect('/penjual/dashboard?msg=Status+dan+posisi+lapak+berhasil+diperbarui');
    } catch (error) {
      console.error('Error update status location seller:', error);
      res.redirect('/penjual/dashboard?error=Gagal+memperbarui+status+dan+posisi');
    }
  }
};

module.exports = sellerController;
