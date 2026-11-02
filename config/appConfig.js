/**
 * Konfigurasi Utama Aplikasi Kebab Corner
 */

const appConfig = {
  appName: 'Kebab Corner',
  appTagline: 'Cita Rasa Kebab Autentik, Lezat & Dibuat Fresh Setiap Hari',
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development'
};

module.exports = appConfig;
