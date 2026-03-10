const jwt = require('jsonwebtoken');
const User = require('../models/User');

const telegramLogin = async (req, res) => {
    try {
        const { id, username, first_name } = req.telegramUser;

        // Find or create user
        let user = await User.findOne({ telegramId: id.toString() });

        if (!user) {
            user = new User({
                telegramId: id.toString(),
                username: username || '',
                firstName: first_name || '',
                balance: 1000 // Default balance
            });
            await user.save();
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '15m' }
        );

        res.json({
            token,
            user: {
                username: user.username,
                firstName: user.firstName,
                balance: user.balance
            }
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    telegramLogin
};
