const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');

async function checkUserTarget() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-learning');

        const user = await User.findOne();
        if (user) {
            console.log(`User: ${user.email}`);
            console.log(`Target Exam: ${user.target_exam}`);
        } else {
            console.log('No user found');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUserTarget();
