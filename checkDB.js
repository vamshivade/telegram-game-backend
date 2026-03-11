const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

const User = mongoose.model('User', UserSchema);

const MONGO_URI = 'mongodb://localhost:27017/telegram_games';

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const count = await User.countDocuments();
        const admins = await User.countDocuments({ role: 'admin' });
        console.log(`Total users: ${count}`);
        console.log(`Admin users: ${admins}`);
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

check();
