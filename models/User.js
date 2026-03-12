const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        default: ''
    },
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    photoUrl: {
        type: String,
        default: ''
    },
    languageCode: {
        type: String,
        default: ''
    },
    balance: {
        type: Number,
        default: 1000
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
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
