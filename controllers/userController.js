const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DailyUserReport = require('../models/DailyUserReport');

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-__v');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const claimDailyBonus = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const now = new Date();
        // Get the current date in UTC at 00:00:00
        const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).getTime();

        if (user.lastDailyBonus) {
            const lastClaim = new Date(user.lastDailyBonus);
            // Get the last claim date in UTC at 00:00:00
            const lastClaimUTC = new Date(Date.UTC(lastClaim.getUTCFullYear(), lastClaim.getUTCMonth(), lastClaim.getUTCDate())).getTime();

            if (todayUTC === lastClaimUTC) {
                return res.status(400).json({ message: 'Daily bonus already claimed for today (UTC).' });
            }
        }

        user.balance += 1000;
        user.lastDailyBonus = now; // Store the exact claim time
        await user.save();

        res.json({
            message: 'Daily bonus claimed! +1000 coins.',
            balance: user.balance,
            lastDailyBonus: user.lastDailyBonus
        });
    } catch (err) {
        console.error('Claim bonus error:', err.message);
        res.status(500).send('Server error');
    }
};

/**
 * POST /user/ad-reward
 * Credits a small coin reward after the user watches a Monetag ad.
 * Amount is capped server-side to prevent abuse.
 */
const claimAdReward = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { amount } = req.body;
        const requestedAmount = parseInt(amount, 10) || 50;
        const rewardAmount = Math.min(Math.max(requestedAmount, 1), 200); // 1–200 coins

        user.balance += rewardAmount;

        await user.save();

        console.log(`[AdReward] User ${user.telegramId} earned ${rewardAmount} coins`);

        res.json({
            message: `Ad reward claimed! +${rewardAmount} coins.`,
            balance: user.balance,
            earned: rewardAmount
        });
    } catch (err) {
        console.error('Ad reward error:', err.message);
        res.status(500).send('Server error');
    }
};

/**
 * POST /user/record-login
 * Used exclusively by the automated loop to push 'bot' logins to the user's daily report
 */
const recordBotLogin = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const now = new Date();
        const dateStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
        
        await DailyUserReport.findOneAndUpdate(
            { userId: user._id, date: dateStr },
            {
                $setOnInsert: { telegramId: user.telegramId },
                $push: { logins: { isBot: true, timestamp: now } }
            },
            { new: true, upsert: true }
        );

        res.json({ success: true, message: 'Bot login recorded' });
    } catch (err) {
        console.error('Record bot login error:', err.message);
        res.status(500).send('Server error');
    }
};

const getAllUsersForBot = async (req, res) => {
    try {
        const requestUser = await User.findById(req.userId);
        if (!requestUser || requestUser.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized for bot automation' });
        }

        const users = await User.find({}).sort({ createdAt: -1 });
        const usersWithTokens = users.map(u => ({
            id: u._id,
            telegramId: u.telegramId,
            username: u.username || u.firstName || 'User',
            token: jwt.sign(
                { userId: u._id },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '7d' }
            )
        }));

        res.json(usersWithTokens);
    } catch (err) {
        console.error('Bot all users fetch error:', err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    getProfile,
    claimDailyBonus,
    claimAdReward,
    getAllUsersForBot,
    recordBotLogin
};
