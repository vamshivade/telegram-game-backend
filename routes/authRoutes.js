const express = require('express');
const router = express.Router();
const { telegramLogin } = require('../controllers/authController');
const verifyTelegram = require('../middleware/verifyTelegram');

// @route   POST api/auth/telegram
// @desc    Auth with Telegram initData
router.post('/telegram', verifyTelegram, telegramLogin);

module.exports = router;
