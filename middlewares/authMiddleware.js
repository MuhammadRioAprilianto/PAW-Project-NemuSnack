/**
 * Authentication & Role Authorization Middleware - NemuSnack
 * Mengatur hak akses pengguna berdasarkan status login dan role (Admin, Penjual, Pembeli)
 */

const authMiddleware = {
  /**
   * Menyuntikkan info user yang sedang login ke res.locals
   * agar dapat diakses di seluruh template EJS (seperti navbar dan footer)
   */
  injectUser(req, res, next) {
    res.locals.currentUser = req.session && req.session.user ? req.session.user : null;
    next();
  },

  /**
   * Memastikan pengguna sudah login
   */
  isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
      return next();
    }

    if (req.originalUrl.startsWith('/api')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak: Anda harus login terlebih dahulu'
      });
    }

    return res.redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
  },

  /**
   * Memastikan pengguna memiliki salah satu role yang diizinkan
   * @param {Array<string>|string} allowedRoles 
   */
  hasRole(allowedRoles) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
      if (!req.session || !req.session.user) {
        if (req.originalUrl.startsWith('/api')) {
          return res.status(401).json({
            success: false,
            message: 'Akses ditolak: Anda harus login terlebih dahulu'
          });
        }
        return res.redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
      }

      if (roles.includes(req.session.user.role)) {
        return next();
      }

      if (req.originalUrl.startsWith('/api')) {
        return res.status(403).json({
          success: false,
          message: `Akses ditolak: Fitur ini hanya untuk role [${roles.join(', ')}]`
        });
      }

      return res.status(403).render('errors/404', {
        title: '403 - Akses Ditolak',
        appName: 'NemuSnack',
        currentPath: req.path,
        errorMessage: `Anda tidak memiliki izin untuk mengakses halaman ini. Peran yang diizinkan: ${roles.join(', ')}.`
      });
    };
  },

  /**
   * Middleware khusus Admin
   */
  isAdmin(req, res, next) {
    return authMiddleware.hasRole(['admin'])(req, res, next);
  },

  /**
   * Middleware khusus Penjual atau Admin
   */
  isPenjual(req, res, next) {
    return authMiddleware.hasRole(['penjual', 'admin'])(req, res, next);
  },

  /**
   * Middleware khusus Pembeli atau Admin
   */
  isPembeli(req, res, next) {
    return authMiddleware.hasRole(['pembeli', 'admin'])(req, res, next);
  }
};

module.exports = authMiddleware;
