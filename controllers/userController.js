const User = require('../models/User');

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

module.exports = {
    getProfile,
    claimDailyBonus
};
