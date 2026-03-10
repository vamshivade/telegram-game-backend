const jwt = require('jsonwebtoken');
const User = require('../models/User');

const telegramLogin = async (req, res) => {
    try {
        const {
            id,
            username,
            first_name,
            last_name,
            photo_url,
            language_code
        } = req.telegramUser;

        if (!id) {
            return res.status(400).json({ message: 'Invalid Telegram user data: missing id' });
        }

        const telegramId = id.toString();

        // Upsert: find existing user or create a new one, always updating Telegram fields
        let user = await User.findOneAndUpdate(
            { telegramId },
            {
                $set: {
                    username: username || '',
                    firstName: first_name || '',
                    lastName: last_name || '',
                    photoUrl: photo_url || '',
                    languageCode: language_code || '',
                },
                $setOnInsert: {
                    telegramId,
                    balance: 1000, // Default balance only on first create
                }
            },
            { new: true, upsert: true, runValidators: true }
        );

        console.log(`[Auth] User ${telegramId} (${username || first_name}) logged in. DB ID: ${user._id}`);

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                telegramId: user.telegramId,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                photoUrl: user.photoUrl,
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
