/**
 * Konfigurasi Utama Aplikasi NemuSnack
 */

const appConfig = {
  appName: 'NemuSnack',
  appTagline: 'Jajanan Kaki Lima Favoritmu, Dilacak Real-Time',
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development'
};

module.exports = appConfig;
