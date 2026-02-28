const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const TestService = require('./src/services/testService');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const service = TestService;
        const user = await User.findOne();

        if (!user) {
            console.log('No user found in DB');
            return;
        }

        console.log('--- DIAGNOSTIC START ---');
        console.log('User:', user.email, 'Target Exam:', user.target_exam);

        // Try Physics for whatever exam they have
        const subjects = {
            'JEE': 'Physics',
            'NEET': 'Physics',
            'BITSAT': 'Physics'
        };
        const subject = subjects[user.target_exam] || 'Physics';

        console.log('Starting test for subject:', subject);
        const result = await service.startTest(user._id, subject);
        console.log('SUCCESS! Question ID:', result.question?.question_id);
        console.log('--- DIAGNOSTIC END ---');
    } catch (err) {
        console.log('--- DIAGNOSTIC ERROR ---');
        console.log('Message:', err.message);
        console.log('Status:', err.statusCode);
        if (err.stack) console.log('Stack:', err.stack);
        console.log('--- END ERROR ---');
    } finally {
        await mongoose.disconnect();
    }
}

test();
