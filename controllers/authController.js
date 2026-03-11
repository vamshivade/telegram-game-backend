const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DailyUserReport = require('../models/DailyUserReport');

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

        let user = await User.findOne({ telegramId });

        if (!user) {
            // Create a brand new user explicitly
            user = new User({
                telegramId,
                username: username || '',
                firstName: first_name || '',
                lastName: last_name || '',
                photoUrl: photo_url || '',
                languageCode: language_code || '',
                balance: 1000 // default
            });
            await user.save();
            console.log(`[Auth] New User created: ${telegramId} (${username || first_name}). DB ID: ${user._id}`);
        } else {
            // Update existing user fields
            user.username = username || user.username;
            user.firstName = first_name || user.firstName;
            user.lastName = last_name || user.lastName;
            user.photoUrl = photo_url || user.photoUrl;
            user.languageCode = language_code || user.languageCode;
            await user.save();
            console.log(`[Auth] Existing User logged in: ${telegramId} (${username || first_name}). DB ID: ${user._id}`);
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        // Record User Login in DailyUserReport
        const now = new Date();
        const dateStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
        await DailyUserReport.findOneAndUpdate(
            { userId: user._id, date: dateStr },
            {
                $setOnInsert: { telegramId },
                $push: { logins: { isBot: false, timestamp: now } }
            },
            { new: true, upsert: true }
        );

        res.json({
            token,
            user: {
                telegramId: user.telegramId,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                photoUrl: user.photoUrl,
                balance: user.balance,
                role: user.role
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
