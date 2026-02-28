const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const TestService = require('./src/services/testService');
const User = require('./src/models/User');

// Redirect console.log to a file
const logFile = fs.createWriteStream('sim_debug.log', { flags: 'w' });
const originalLog = console.log;
console.log = function (...args) {
    logFile.write(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') + '\n');
    originalLog.apply(console, args);
};

async function simulateTest() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-learning');

        const testService = new TestService();
        const user = await User.findOne();
        if (!user) throw new Error('No user found');

        console.log(`Simulating Nuclei test for user: ${user.email}`);

        // Start test
        const result = await testService.startTest(user._id, 'Physics', 'Nuclei');
        console.log(`Test Started. Question ID: ${result.question.question_id}`);
        console.log(`Question Chapter: ${result.question.chapter}`);

        // Get next question
        const next = await testService.getNextQuestion(user._id, result.session.test_id);
        console.log(`Next Question ID: ${next.question_id}`);
        console.log(`Next Question Chapter: ${next.chapter}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

simulateTest();
