/**
 * Controller Chat AI Assistant - NemuSnack
 * Mengatur penerimaan request chat pengguna, pemanggilan Gemini Service, dan penyusunan response JSON
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

      // Panggil Service Gemini dengan pesan yang sudah tervalidasi oleh middleware
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

      // Status 503 jika API key belum dikonfigurasi, atau 500 untuk error internal lainnya
      const statusCode = error.message.includes('GEMINI_API_KEY') ? 503 : 500;

      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Terjadi kesalahan saat memproses permintaan AI Assistant',
        error: error.message
      });
    }
  }
};

module.exports = chatController;
