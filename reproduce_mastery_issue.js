const mongoose = require('mongoose');
const User = require('./backend/src/models/User');
const TestService = require('./backend/src/services/testService');
const TopicMastery = require('./backend/src/models/TopicMastery');
const JSONLoader = require('./backend/src/utils/jsonLoader');
const dotenv = require('dotenv');

dotenv.config({ path: './backend/.env' });

async function runReproduction() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Create a dummy user
        const userEmail = `test_mastery_${Date.now()}@example.com`;
        const user = await User.create({
            name: 'Test Mastery User',
            email: userEmail,
            password: 'Password123',
            grade: '12th',
            target_exam: 'JEE',
            ability_score: 0.3
        });
        console.log('User created:', user._id);

        // 2. Start a test
        const subject = 'Mathematics';
        const startResult = await TestService.startTest(user._id, subject);
        const session = startResult.session;
        console.log('Test started, session id:', session._id);

        // 3. Mock 5 easy question submissions with incorrect answers
        // We'll use actual questions from the json to get topic tags
        const exam = 'jee';
        const questions = JSONLoader.getQuestion({ exam, subject, difficulty: 'easy', count: 5 });

        console.log(`Submitting 5 incorrect answers for topic: ${questions[0].topic_tags[0]}`);

        for (const q of questions) {
            await TestService.submitAnswer(user._id, q.question_id, 'wrong_option');
            console.log(`Submitted incorrect answer for ${q.question_id}`);
        }

        // 4. Check TopicMastery
        const mastery = await TopicMastery.find({ user_id: user._id });
        console.log('Mastery records found after 5 incorrect answers:', mastery.length);

        if (mastery.length === 0) {
            console.error('FAILED: No mastery records created!');
        } else {
            console.log('Mastery record details:', JSON.stringify(mastery, null, 2));
        }

        // Cleanup
        await User.findByIdAndDelete(user._id);
        // We'd also clean up Test, TestSession, Answers, TopicMastery here in a real test
        process.exit(0);
    } catch (err) {
        console.error('Error during reproduction:', err);
        process.exit(1);
    }
}

runReproduction();
