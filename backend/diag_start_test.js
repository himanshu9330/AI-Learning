const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const TestService = require('./src/services/testService');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const service = new TestService();
        const user = await User.findOne({ target_exam: 'NEET' });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('Testing startTest for user:', user.email, 'subject: Physics');
        const result = await service.startTest(user._id, 'Physics');
        console.log('Success:', result.question?.question_id);
    } catch (err) {
        console.error('Error in test:', err.message, err.statusCode);
        if (err.stack) console.error(err.stack);
    } finally {
        await mongoose.disconnect();
    }
}

test();
