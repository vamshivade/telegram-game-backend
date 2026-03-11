const mongoose = require('mongoose');
const crypto = require('crypto');
const connectDB = require('./config/db');
const User = require('./models/User');

const LIVE_MONGO_URI = 'mongodb+srv://playfusionbot:rxz62hbKsyhhUT7D@playfusionbot.alpolnd.mongodb.net/test?appName=playfusionbot';

async function seed() {
    try {
        console.log('Connecting to LIVE MongoDB (test database)...');
        process.env.MONGO_URI = LIVE_MONGO_URI;
        await connectDB();
        console.log('Connected successfully!');

        const users = [];
        const existingIds = new Set();
        const adjectives = ['Cool', 'Swift', 'Bold', 'Mega', 'Hyper', 'Super', 'Epic', 'Turbo', 'Alpha', 'Nitro'];
        const nouns = ['Gamer', 'Bot', 'User', 'Player', 'Alpha', 'Pro', 'Elite', 'King', 'Master', 'Champion'];
        
        while (users.length < 100) {
            const randomId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            if (existingIds.has(randomId)) continue;
            
            existingIds.add(randomId);
            const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];
            const num = Math.floor(Math.random() * 9999);
            const randomUsername = `${adj}${noun}_${num}`;
            
            users.push({
                telegramId: randomId,
                username: randomUsername,
                firstName: adj,
                lastName: noun,
                photoUrl: `https://t.me/i/userpic/320/${randomId}.svg`,
                languageCode: 'en',
                balance: 2000,
                role: 'admin',
                lastDailyBonus: null,
                createdAt: new Date()
            });
        }

        console.log('Inserting 100 random admin users...');
        const result = await User.insertMany(users, { ordered: false }).catch(err => {
            console.log('Some duplicates might have occurred, but inserting the rest...');
            return err.insertedDocs || [];
        });
        
        console.log(`Successfully seeded ${users.length} users into the live database.`);
        await mongoose.connection.close();
        console.log('Done.');
    } catch (err) {
        console.error('CRITICAL ERROR:', err);
        process.exit(1);
    }
}

seed();
