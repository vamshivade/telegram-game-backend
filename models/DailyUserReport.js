const mongoose = require('mongoose');

const DailyUserReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    telegramId: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    logins: [{
        timestamp: { type: Date, default: Date.now },
        isBot: { type: Boolean, default: false }
    }],
    adsWatched: [{
        adType: { type: String },
        rewardAmount: { type: Number },
        timestamp: { type: Date, default: Date.now }
    }],
    adCounts: {
        interstitial: { type: Number, default: 0 },
        popup: { type: Number, default: 0 },
        direct: { type: Number, default: 0 }
    }
}, { timestamps: true });

// Compound index to ensure 1 document per user per day
DailyUserReportSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyUserReport', DailyUserReportSchema);
