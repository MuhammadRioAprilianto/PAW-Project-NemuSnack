/**
 * Konfigurasi Utama Aplikasi NemuSnack
 */

require('dotenv').config();

const appConfig = {
  appName: process.env.APP_NAME || 'NemuSnack',
  appTagline: 'Jajanan Kaki Lima Favoritmu, Dilacak Real-Time',
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  sessionSecret: process.env.SESSION_SECRET || 'nemusnack_default_secret_key',
};

module.exports = appConfig;
