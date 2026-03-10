const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.userId = decoded.userId;

        // Extra check for strict mode: ensure user is valid Telegram user if required
        if (process.env.APP_MODE === 'production') {
            const user = await User.findById(req.userId);
            if (!user || user.telegramId === 'dev_user') {
                return res.status(403).json({ message: 'Telegram authentication required in production.' });
            }
        }

        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
