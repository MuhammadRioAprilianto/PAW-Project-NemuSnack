/**
 * Controller Chat AI Assistant - NemuSnack
 * Mengatur penerimaan pesan pengguna dan penyusunan response JSON asisten
 */

const { askGemini } = require('../services/gemini.service');

const chatController = {
  /**
   * Menangani permintaan percakapan dengan AI Assistant
   * Endpoint: POST /api/chat
   * Body: { "message": "Pertanyaan pengguna" }
   */
  async chat(req, res) {
    try {
      const { message } = req.body;

      // Panggil layanan asisten dengan pesan yang sudah tervalidasi oleh middleware
      const reply = await askGemini(message);

      return res.status(200).json({
        success: true,
        message: 'Berhasil mendapatkan balasan dari AI Assistant',
        data: {
          reply: reply
        }
      });
    } catch (error) {
      console.error('Controller Chat AI Error:', error.message);

      // API tidak tersedia jika konfigurasi layanan belum siap.
      const statusCode = error.message.includes('GEMINI_API_KEY') ? 503 : 500;

      return res.status(statusCode).json({
        success: false,
        message: 'Asisten sedang mengalami kendala. Silakan coba kembali nanti.'
      });
    }
  }
};

module.exports = chatController;
