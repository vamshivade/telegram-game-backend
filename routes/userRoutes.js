const express = require('express');
const router = express.Router();
const { getProfile, claimDailyBonus } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET api/user/profile
// @desc    Get current user profile
router.get('/profile', authMiddleware, getProfile);

// @route   POST api/user/claim-bonus
// @desc    Claim daily login bonus
router.post('/claim-bonus', authMiddleware, claimDailyBonus);

module.exports = router;
