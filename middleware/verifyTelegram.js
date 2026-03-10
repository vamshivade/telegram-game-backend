const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Validates Telegram initData using HMAC-SHA256
 * Supports dual modes: development and production
 */
const verifyTelegram = (req, res, next) => {
    const { initData, isTelegram } = req.body;
    const APP_MODE = process.env.APP_MODE || 'production';

    // 1. If strict production mode, block any non-Telegram request
    if (APP_MODE === 'production' && !isTelegram) {
        return res.status(403).json({ message: 'Production mode requires Telegram Mini App.' });
    }

    // 2. Handle Development Mode - Browser Login (Mock User)
    if (APP_MODE === 'development' && !isTelegram) {
        req.telegramUser = {
            id: 'dev_user',
            username: 'DevUser',
            first_name: 'Development'
        };
        return next();
    }

    // 3. Handle Telegram Login (Valid both in Dev and Prod)
    if (!initData) {
        return res.status(401).json({ message: 'No initData provided.' });
    }

    console.log('--- Telegram initData ---');
    console.log(initData);
    console.log('-------------------------');

    // Skip validation only in development mode if token is missing
    if (APP_MODE === 'development' && !process.env.TELEGRAM_BOT_TOKEN) {
        console.warn('TELEGRAM_BOT_TOKEN not set. Bypassing validation in development mode.');
        try {
            const urlParams = new URLSearchParams(initData);
            const userStr = urlParams.get('user');
            if (!userStr) {
                return res.status(400).json({ message: 'No user data in initData' });
            }
            req.telegramUser = JSON.parse(userStr);
            return next();
        } catch (e) {
            return res.status(400).json({ message: 'Invalid user data in initData' });
        }
    }

    // Strict HMAC Validation
    // IMPORTANT: Build dataCheckString from the RAW initData string (not URLSearchParams-decoded)
    // because Telegram signs the raw key=value pairs, and URLSearchParams auto-decodes values.
    try {
        const pairs = initData.split('&');
        let hash = null;
        const filteredPairs = [];

        for (const pair of pairs) {
            const eqIdx = pair.indexOf('=');
            const key = pair.substring(0, eqIdx);
            const value = pair.substring(eqIdx + 1);
            if (key === 'hash') {
                hash = value;
            } else {
                filteredPairs.push(`${key}=${value}`);
            }
        }

        if (!hash) {
            return res.status(400).json({ message: 'Missing hash in initData' });
        }

        // Sort alphabetically and join with newline — as per Telegram spec
        const dataCheckString = filteredPairs.sort().join('\n');

        const secretKey = crypto.createHmac('sha256', 'WebAppData')
            .update(process.env.TELEGRAM_BOT_TOKEN)
            .digest();

        const hmac = crypto.createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        if (hmac === hash) {
            // Use URLSearchParams to properly decode and extract the user object
            const urlParams = new URLSearchParams(initData);
            const userStr = urlParams.get('user');
            if (!userStr) {
                return res.status(400).json({ message: 'No user data in initData' });
            }
            req.telegramUser = JSON.parse(userStr);
            next();
        } else {
            console.error('HMAC mismatch. Expected:', hmac, 'Got:', hash);
            res.status(403).json({ message: 'Invalid Telegram signature' });
        }
    } catch (err) {
        console.error('Telegram validation error:', err);
        res.status(400).json({ message: 'Validation failed' });
    }
};

module.exports = verifyTelegram;
