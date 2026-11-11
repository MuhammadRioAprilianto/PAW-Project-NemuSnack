/**
 * Entry Point Utama Aplikasi NemuSnack
 * Inisialisasi Express, Session, Middleware Logger, View Engine EJS, Routing MVC, dan Server
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');

// Konfigurasi aplikasi & database
const appConfig = require('./config/appConfig');
const db = require('./config/db');

// Middleware
const loggerMiddleware = require('./middlewares/loggerMiddleware');
const authMiddleware = require('./middlewares/authMiddleware');

// Routes MVC
const pageRoutes = require('./routes/pageRoutes');
const apiRoutes = require('./routes/apiRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sellerRoutes = require('./routes/sellerRoutes');

// Inisialisasi Express
const app = express();

// 1. Pengaturan View Engine EJS & Layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// 2. Middleware Parsing Request Body (JSON & Form URL-Encoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Middleware Static Files (Aset Gambar, CSS, JS dsb)
app.use(express.static(path.join(__dirname, 'public')));

// 4. Middleware Session (Autentikasi 3 Role: Admin, Penjual, Pembeli)
app.use(
  session({
    secret: appConfig.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 hari
      httpOnly: true,
      secure: false // true jika menggunakan HTTPS di produksi
    }
  })
);

// 5. Injeksi Data User Login ke EJS Template (res.locals.currentUser)
app.use(authMiddleware.injectUser);

// 6. Middleware Logger (Mencatat HTTP method, path, status, timestamp ke console/terminal)
app.use(loggerMiddleware);

// Injeksi Catatan Log Terakhir ke EJS Template (res.locals.lastActivityLog)
app.use((req, res, next) => {
  res.locals.lastActivityLog = (req.session && req.session.lastActivityLog) 
    ? req.session.lastActivityLog 
    : loggerMiddleware.getLatestMemoryLog();
  next();
});

// 7. Registrasi Routes MVC
// Routes Autentikasi (/login, /register, /logout)
app.use('/', authRoutes);

// Routes Khusus Admin (/admin/dashboard, /admin/users, dsb)
app.use('/admin', adminRoutes);

// Routes Khusus Penjual/Pedagang (/penjual/dashboard, /penjual/products, dsb)
app.use('/penjual', sellerRoutes);

// Routes REST API CRUD (/api/status, /api/produk, /api/rekomendasi, dsb)
app.use('/api', apiRoutes);

// Routes Halaman Publik & Pembeli (/, /menu, /produk/:id)
app.use('/', pageRoutes);

// 8. Penanganan 404 (Route Not Found)
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `Endpoint API "${req.method} ${req.originalUrl}" tidak ditemukan`
    });
  }

  res.status(404).render('errors/404', {
    title: `404 - Halaman Tidak Ditemukan | ${appConfig.appName}`,
    appName: appConfig.appName,
    currentPath: req.path
  });
});

// 9. Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  if (req.originalUrl.startsWith('/api')) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan internal pada server API',
      error: appConfig.env === 'development' ? err.message : undefined
    });
  }

  res.status(500).render('errors/404', {
    title: `500 - Server Error | ${appConfig.appName}`,
    appName: appConfig.appName,
    currentPath: req.path,
    errorMessage: 'Terjadi gangguan internal pada server'
  });
});

// 10. Menjalankan Server
if (require.main === module) {
  app.listen(appConfig.port, () => {
    console.log(`=================================================`);
    console.log(`  🚀 ${appConfig.appName} Server is running`);
    console.log(`  🌐 Local URL    : http://localhost:${appConfig.port}`);
    console.log(`  📋 API Status   : http://localhost:${appConfig.port}/api/status`);
    console.log(`  📦 API CRUD     : http://localhost:${appConfig.port}/api/produk`);
    console.log(`  🔐 Login/Auth   : http://localhost:${appConfig.port}/login`);
    console.log(`  🛠️ Admin Dash   : http://localhost:${appConfig.port}/admin/dashboard`);
    console.log(`  🏪 Penjual Dash : http://localhost:${appConfig.port}/penjual/dashboard`);
    console.log(`  🏷️ Environment  : ${appConfig.env}`);
    console.log(`=================================================`);
  });
}

module.exports = app;
