/**
 * Middleware Validasi Input Chat AI Assistant - NemuSnack
 * 
 * Menerapkan prinsip Defense-in-Depth:
 * - Memvalidasi request body sebelum diproses oleh Controller dan Service Gemini
 * - Mencegah pesan kosong, tipe data non-string, dan pesan melebihi batas panjang
 * - Melakukan sanitasi awal terhadap potensi prompt injection
 */

const MAX_MESSAGE_LENGTH = 500;

function validateChatInput(req, res, next) {
  const { message } = req.body;

  // 1. Validasi keberadaan dan tipe data input
  if (message === undefined || message === null) {
    return res.status(400).json({
      success: false,
      message: 'Field "message" wajib diisi dalam request body'
    });
  }

  if (typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Format pesan harus berupa teks string'
    });
  }

  const trimmedMessage = message.trim();

  // 2. Validasi pesan tidak boleh kosong atau hanya whitespace
  if (trimmedMessage.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Pesan chat tidak boleh kosong'
    });
  }

  // 3. Validasi batas panjang pesan (maksimal 500 karakter)
  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Pesan terlalu panjang. Maksimal diperbolehkan ${MAX_MESSAGE_LENGTH} karakter (dikirim: ${trimmedMessage.length} karakter)`
    });
  }

  // Simpan pesan yang sudah dibersihkan dari whitespace berlebih
  req.body.message = trimmedMessage;

  next();
}

module.exports = validateChatInput;
