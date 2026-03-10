const mongoose = require('mongoose');

const GameSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gameId: {
        type: String,
        required: true
    },
    betAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['playing', 'completed'],
        default: 'playing'
    },
    result: {
        type: String
    },
    multiplier: {
        type: Number,
        default: 0
    },
    logs: [
        {
            time: String,
            result: String,
            payout: Number
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GameSession', GameSessionSchema);
