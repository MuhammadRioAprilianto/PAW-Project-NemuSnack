/**
 * Admin Controller - NemuSnack
 * Mengatur dashboard monitoring, pengelolaan user, dan riwayat aktivitas/event sistem
 */

const userModel = require('../models/userModel');
const logModel = require('../models/logModel');
const productModel = require('../models/productModel');
const formatCurrency = require('../utils/formatCurrency');
const appConfig = require('../config/appConfig');

const adminController = {
  /**
   * Menampilkan Dashboard Admin
   */
  async getDashboard(req, res) {
    try {
      const stats = await userModel.getDashboardStats();
      const users = await userModel.getAllUsers();
      const recentLogs = await logModel.getRecentLogs(50);
      const allProducts = await productModel.getAllProducts();

      res.render('pages/dashboard-admin', {
        title: `Admin Dashboard Monitoring - ${appConfig.appName}`,
        appName: appConfig.appName,
        currentPath: '/admin/dashboard',
        stats,
        users,
        recentLogs,
        products: allProducts,
        formatCurrency,
        msg: req.query.msg || null,
        error: req.query.error || null
      });
    } catch (error) {
      console.error('Error saat memuat Dashboard Admin:', error);
      res.status(500).render('errors/404', {
        title: '500 - Server Error',
        appName: appConfig.appName,
        currentPath: '/admin/dashboard',
        errorMessage: 'Gagal memuat data Dashboard Admin'
      });
    }
  },

  /**
   * Memperbarui role user
   */
  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['admin', 'penjual', 'pembeli'].includes(role)) {
        return res.redirect('/admin/dashboard?error=Role+tidak+valid');
      }

      await userModel.updateRole(id, role);
      res.redirect('/admin/dashboard?msg=Role+pengguna+berhasil+diperbarui');
    } catch (error) {
      console.error('Error saat update role user:', error);
      res.redirect('/admin/dashboard?error=Gagal+mengubah+role+pengguna');
    }
  },

  /**
   * Menghapus user
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      // Cegah admin menghapus akunnya sendiri
      if (req.session.user && req.session.user.id === parseInt(id, 10)) {
        return res.redirect('/admin/dashboard?error=Tidak+dapat+menghapus+akun+Anda+sendiri');
      }

      await userModel.deleteUser(id);
      res.redirect('/admin/dashboard?msg=Pengguna+berhasil+dihapus');
    } catch (error) {
      console.error('Error saat menghapus user:', error);
      res.redirect('/admin/dashboard?error=Gagal+menghapus+pengguna');
    }
  },

  /**
   * Menghapus produk oleh Admin (moderasi konten)
   */
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      await productModel.deleteProduct(id);
      res.redirect('/admin/dashboard?msg=Produk+berhasil+dihapus+oleh+Admin');
    } catch (error) {
      console.error('Error saat admin menghapus produk:', error);
      res.redirect('/admin/dashboard?error=Gagal+menghapus+produk');
    }
  }
};

module.exports = adminController;
