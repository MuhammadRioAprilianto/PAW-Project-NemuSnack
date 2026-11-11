/**
 * Auth Controller - NemuSnack
 * Mengatur autentikasi login, registrasi akun 3 role (Admin, Penjual, Pembeli), dan logout
 */

const userModel = require('../models/userModel');
const appConfig = require('../config/appConfig');

const authController = {
  /**
   * Menampilkan form login
   */
  getLoginPage(req, res) {
    if (req.session && req.session.user) {
      return authController.redirectByRole(req.session.user.role, res);
    }

    res.render('pages/login', {
      title: `Masuk Akun - ${appConfig.appName}`,
      appName: appConfig.appName,
      currentPath: '/login',
      error: req.query.error || null,
      success: req.query.success || null,
      redirect: req.query.redirect || ''
    });
  },

  /**
   * Memproses login pengguna
   */
  async handleLogin(req, res) {
    try {
      const { email, password, redirect } = req.body;

      if (!email || !password) {
        return res.render('pages/login', {
          title: `Masuk Akun - ${appConfig.appName}`,
          appName: appConfig.appName,
          currentPath: '/login',
          error: 'Email dan password wajib diisi',
          success: null,
          redirect: redirect || ''
        });
      }

      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.render('pages/login', {
          title: `Masuk Akun - ${appConfig.appName}`,
          appName: appConfig.appName,
          currentPath: '/login',
          error: 'Akun dengan email tersebut tidak ditemukan',
          success: null,
          redirect: redirect || ''
        });
      }

      const isMatch = await userModel.verifyPassword(password, user.password);
      if (!isMatch) {
        return res.render('pages/login', {
          title: `Masuk Akun - ${appConfig.appName}`,
          appName: appConfig.appName,
          currentPath: '/login',
          error: 'Password yang Anda masukkan salah',
          success: null,
          redirect: redirect || ''
        });
      }

      // Simpan session pengguna
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      };

      if (redirect && redirect.startsWith('/')) {
        return res.redirect(redirect);
      }

      return authController.redirectByRole(user.role, res);
    } catch (error) {
      console.error('Error saat login:', error);
      return res.render('pages/login', {
        title: `Masuk Akun - ${appConfig.appName}`,
        appName: appConfig.appName,
        currentPath: '/login',
        error: 'Terjadi kesalahan sistem saat mencoba masuk',
        success: null,
        redirect: ''
      });
    }
  },

  /**
   * Menampilkan form pendaftaran
   */
  getRegisterPage(req, res) {
    if (req.session && req.session.user) {
      return authController.redirectByRole(req.session.user.role, res);
    }

    res.render('pages/register', {
      title: `Daftar Akun Baru - ${appConfig.appName}`,
      appName: appConfig.appName,
      currentPath: '/register',
      error: null,
      success: null
    });
  },

  /**
   * Memproses pendaftaran user baru (Penjual atau Pembeli)
   */
  async handleRegister(req, res) {
    try {
      const { name, email, password, role, phone } = req.body;

      if (!name || !email || !password) {
        return res.render('pages/register', {
          title: `Daftar Akun Baru - ${appConfig.appName}`,
          appName: appConfig.appName,
          currentPath: '/register',
          error: 'Nama, email, dan password wajib diisi',
          success: null
        });
      }

      // Cek apakah email sudah terdaftar
      const existing = await userModel.findByEmail(email);
      if (existing) {
        return res.render('pages/register', {
          title: `Daftar Akun Baru - ${appConfig.appName}`,
          appName: appConfig.appName,
          currentPath: '/register',
          error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
          success: null
        });
      }

      // Validasi role (hanya penjual atau pembeli yang boleh mendaftar sendiri)
      const assignedRole = (role === 'penjual') ? 'penjual' : 'pembeli';

      const newUser = await userModel.createUser({
        name,
        email,
        password,
        role: assignedRole,
        phone: phone || ''
      });

      // Otomatis login
      req.session.user = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone
      };

      return authController.redirectByRole(newUser.role, res);
    } catch (error) {
      console.error('Error saat register:', error);
      return res.render('pages/register', {
        title: `Daftar Akun Baru - ${appConfig.appName}`,
        appName: appConfig.appName,
        currentPath: '/register',
        error: 'Terjadi kesalahan sistem saat mendaftar',
        success: null
      });
    }
  },

  /**
   * Logout user
   */
  handleLogout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Gagal destroy session:', err);
      }
      res.redirect('/login?success=Anda+telah+berhasil+keluar');
    });
  },

  /**
   * Helper redirect berdasarkan role
   */
  redirectByRole(role, res) {
    if (role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    if (role === 'penjual') {
      return res.redirect('/penjual/dashboard');
    }
    return res.redirect('/menu');
  }
};

module.exports = authController;
