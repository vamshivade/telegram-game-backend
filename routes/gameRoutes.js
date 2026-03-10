const express = require('express');
const router = express.Router();
const { startGame, stopGame, getStatus } = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/start', authMiddleware, startGame);
router.post('/stop', authMiddleware, stopGame);
router.get('/status', authMiddleware, getStatus);

module.exports = router;
