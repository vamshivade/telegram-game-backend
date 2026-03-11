const mongoose = require('mongoose');

const DailyUserReportSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    date: String,
    adsWatched: Array
});

const DailyUserReport = mongoose.model('DailyUserReport', DailyUserReportSchema);

const MONGO_URI = 'mongodb://localhost:27017/telegram_games';

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const count = await DailyUserReport.countDocuments();
        const first = await DailyUserReport.findOne().sort({ _id: -1 });
        console.log(`Total reports: ${count}`);
        console.log(`Latest report: ${JSON.stringify(first, null, 2)}`);
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

check();
