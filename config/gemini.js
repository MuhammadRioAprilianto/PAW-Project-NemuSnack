/**
 * Konfigurasi Integrasi Google Gemini API
 * NemuSnack - Platform Direktori & Pemetaan Jajanan Kaki Lima
 * 
 * Keamanan API Key:
 * - API Key HANYA dibaca dari environment variable (.env) di sisi backend server.
 * - API Key TIDAK PERNAH dikirim atau diekspos ke sisi frontend/client.
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = (process.env.GEMINI_API_KEY || '').trim();

if (!apiKey) {
  console.warn(
    '⚠️ [Gemini Config] GEMINI_API_KEY belum diset di file .env. Fitur AI Assistant memerlukan API Key Google Gemini yang valid.'
  );
}

// Inisialisasi client Google Generative AI
// API Key hanya disimpan di backend server
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Nama model default (menggunakan gemini-flash-lite-latest yang aktif dan berkecepatan tinggi)
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';

// Daftar prioritas model fallback jika model utama mengalami lonjakan beban / deprecated
const FALLBACK_MODELS = [
  MODEL_NAME,
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash'
].filter((v, i, a) => a.indexOf(v) === i); // unique only

/**
 * Memeriksa apakah Gemini API Key sudah terkonfigurasi dengan benar
 * @returns {boolean}
 */
const isGeminiConfigured = () => {
  return Boolean(apiKey && apiKey !== 'your_gemini_api_key_here');
};

module.exports = {
  genAI,
  MODEL_NAME,
  FALLBACK_MODELS,
  isGeminiConfigured
};
