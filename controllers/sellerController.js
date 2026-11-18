/**
 * Seller Controller - NemuSnack
 * Mengatur operasional Penjual/Pedagang:
 * - Pengelolaan katalog produk lapak (CRUD)
 * - Pemantauan ulasan & rating dari pembeli
 * - Pengaturan status operasional (Mangkal, Berjalan, Tutup)
 * - Pembaruan koordinat GPS dan rute keliling pedagang
 */

const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
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
      const seller = await userModel.findById(sellerId);
      const products = await productModel.getProductsBySeller(sellerId);
      const reviews = await reviewModel.getBySellerId(sellerId);

      const currentCart = seller || {
        seller_status: 'Mangkal',
        seller_location: 'Belum diatur',
        seller_route: 'Belum diatur',
        seller_lat: -7.7660,
        seller_lng: 110.3800,
        seller_route_points: []
      };

      res.render('pages/dashboard-penjual', {
        title: `Dashboard Pedagang - ${appConfig.appName}`,
        appName: appConfig.appName,
        currentPath: '/penjual/dashboard',
        seller: { ...req.session.user, ...currentCart },
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
      const { name, category, price, whatsapp, description } = req.body;

      if (!name || !price) {
        return res.redirect('/penjual/dashboard?error=Nama+dan+harga+produk+wajib+diisi');
      }

      await productModel.createProduct({
        seller_id: sellerId,
        name,
        category: category || 'Lainnya',
        price: parseInt(price, 10),
        status: 'Mangkal',
        location: '',
        route: '',
        whatsapp: whatsapp || req.session.user.phone || '',
        description: description || '',
        image: req.file ? `/uploads/${req.file.filename}` : '/assets/images/snack-placeholder.svg'
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

      const updates = { ...req.body };
      delete updates.status;
      delete updates.location;
      delete updates.route;
      delete updates.lat;
      delete updates.lng;
      if (req.file) updates.image = `/uploads/${req.file.filename}`;
      await productModel.updateProduct(id, updates);
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
      const allowedStatuses = ['Mangkal', 'Sedang Berjalan', 'Tutup', 'Libur'];
      if (!allowedStatuses.includes(status)) {
        return res.redirect('/penjual/dashboard?error=Status+operasional+tidak+valid');
      }

      let routePoints = [];
      try {
        routePoints = req.body.route_points ? JSON.parse(req.body.route_points) : [];
      } catch {
        return res.redirect('/penjual/dashboard?error=Data+rute+tidak+valid');
      }
      if (!Array.isArray(routePoints) || routePoints.length > 30) {
        return res.redirect('/penjual/dashboard?error=Rute+maksimal+30+titik');
      }

      const parsedLat = Number(lat);
      const parsedLng = Number(lng);
      if (!Number.isFinite(parsedLat) || Math.abs(parsedLat) > 90 || !Number.isFinite(parsedLng) || Math.abs(parsedLng) > 180) {
        return res.redirect('/penjual/dashboard?error=Koordinat+lapak+tidak+valid');
      }

      await userModel.updateSellerStatusAndLocation(sellerId, {
        status,
        location,
        route,
        lat: parsedLat,
        lng: parsedLng,
        routePoints
      });

      res.redirect('/penjual/dashboard?msg=Status+dan+posisi+lapak+berhasil+diperbarui');
    } catch (error) {
      console.error('Error update status location seller:', error);
      res.redirect('/penjual/dashboard?error=Gagal+memperbarui+status+dan+posisi');
    }
  }
};

module.exports = sellerController;
