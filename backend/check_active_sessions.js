const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const TestSession = require('./src/models/TestSession');

async function checkSessions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-learning');

        const sessions = await TestSession.find({ subject: 'Physics' }).sort({ updatedAt: -1 }).limit(5);
        console.log(`FOUND_PHYSICS_SESSIONS=${sessions.length}`);

        sessions.forEach(s => {
            console.log(`--- SESSION ---`);
            console.log(`ID: ${s.test_id}`);
            console.log(`CHAPTER: ${s.chapter}`);
            console.log(`TOPIC: ${s.topic}`);
            console.log(`STATUS: ${s.status}`);
            console.log(`QUEST: ${s.currentQuestionId}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSessions();
