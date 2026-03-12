const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://playfusionbot:rxz62hbKsyhhUT7D@playfusionbot.alpolnd.mongodb.net/test?appName=playfusionbot');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        const User = mongoose.model('User', new mongoose.Schema({
            role: String,
            username: String
        }));

        const totalUsers = await User.countDocuments();
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const sampleUsers = await User.find().limit(5);

        console.log(`Total Users in DB: ${totalUsers}`);
        console.log(`Admin Users in DB: ${adminUsers}`);
        console.log('Sample Usernames:', sampleUsers.map(u => u.username));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

connectDB();
