/**
 * Entry Point Utama Aplikasi NemuSnack
 * Berdasarkan PRD NemuSnack (Muhammad Rio Aprilianto - 20240140204)
 * Inisialisasi Express, Middleware, View Engine EJS, Routing, dan Server
 */

const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

// Konfigurasi aplikasi
const appConfig = require('./config/appConfig');

// Middleware
const loggerMiddleware = require('./middlewares/loggerMiddleware');

// Routes
const pageRoutes = require('./routes/pageRoutes');
const apiRoutes = require('./routes/apiRoutes');

// Inisialisasi Express
const app = express();

// 1. Pengaturan View Engine EJS & Layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// 2. Middleware Parsing Request Body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Middleware Static Files (Aset Gambar, CSS, dsb)
app.use(express.static(path.join(__dirname, 'public')));

// 4. Middleware Logger (Dipasang sebelum routing agar mencatat seluruh request)
app.use(loggerMiddleware);

// 5. Registrasi Routes
// Routing Halaman Frontend
app.use('/', pageRoutes);

// Routing API Endpoint
app.use('/api', apiRoutes);

// 6. Penanganan 404 (Route Not Found)
app.use((req, res) => {
  // Jika request mengarah ke API, kirim response JSON 404
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'Endpoint API tidak ditemukan'
    });
  }

  // Jika request halaman frontend biasa, render halaman 404 EJS
  res.status(404).render('errors/404', {
    title: `404 - Halaman Tidak Ditemukan | ${appConfig.appName}`,
    appName: appConfig.appName,
    currentPath: req.path
  });
});

// 7. Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  if (req.originalUrl.startsWith('/api')) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan internal pada server API'
    });
  }

  res.status(500).render('errors/404', {
    title: `500 - Server Error | ${appConfig.appName}`,
    appName: appConfig.appName,
    currentPath: req.path,
    errorMessage: 'Terjadi gangguan internal pada server'
  });
});

// 8. Menjalankan Server
app.listen(appConfig.port, () => {
  console.log(`=================================================`);
  console.log(`  ${appConfig.appName} Server is running`);
  console.log(`  Local URL : http://localhost:${appConfig.port}`);
  console.log(`  API Status: http://localhost:${appConfig.port}/api/status`);
  console.log(`  API Produk: http://localhost:${appConfig.port}/api/produk`);
  console.log(`  Environment: ${appConfig.env}`);
  console.log(`=================================================`);
});

module.exports = app;
