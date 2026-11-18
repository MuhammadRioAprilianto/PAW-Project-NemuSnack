/**
 * Route Endpoint AI Assistant Chatbot - NemuSnack
 * Menghubungkan route POST /api/chat dengan middleware validasi dan Controller
 */

const express = require('express');
const router = express.Router();

const validateChatInput = require('../middlewares/validateChatInput');
const chatController = require('../controllers/chat.controller');

// Endpoint publik: Pengguna (baik tamu maupun yang sudah login) dapat berinteraksi dengan AI Assistant
// Method: POST /api/chat
router.post('/', validateChatInput, chatController.chat);

module.exports = router;
