const express = require('express');
const router = express.Router();
const { getProfile, claimDailyBonus, claimAdReward, getAllUsersForBot, recordBotLogin } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET api/user/profile
// @desc    Get current user profile
router.get('/profile', authMiddleware, getProfile);

// @route   POST api/user/claim-bonus
// @desc    Claim daily login bonus
router.post('/claim-bonus', authMiddleware, claimDailyBonus);

// @route   POST api/user/ad-reward
// @desc    Credit coins after user watches a Monetag ad
router.post('/ad-reward', authMiddleware, claimAdReward);

// @route   GET api/user/all-users
// @desc    Admin only: Get all users with tokens for bot automation
router.get('/all-users', authMiddleware, getAllUsersForBot);

// @route   POST api/user/record-login
// @desc    Track a bot login event
router.post('/record-login', authMiddleware, recordBotLogin);

module.exports = router;
