const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String
    },
    firstName: {
        type: String
    },
    balance: {
        type: Number,
        default: 1000
    },
    lastDailyBonus: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
