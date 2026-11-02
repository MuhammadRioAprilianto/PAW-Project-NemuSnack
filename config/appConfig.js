/**
 * Konfigurasi Utama Aplikasi NemuSnack
 * Berdasarkan Product Requirements Document (PRD) v1.0
 * Penulis: Muhammad Rio Aprilianto - 20240140204
 */

const appConfig = {
  appName: 'NemuSnack',
  appTagline: 'Solusi Cerdas Menemukan Jajanan Kaki Lima (PKL) Terdekat',
  author: 'Muhammad Rio Aprilianto',
  nim: '20240140204',
  version: 'v1.0',
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development'
};

module.exports = appConfig;
