const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

async function debug() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/ai-learning');
        const TestService = require('./src/services/testService');
        const User = require('./src/models/User');
        const user = await User.findOne();

        console.log('User Target:', user.target_exam);

        // Mock session object as it would be in AdaptiveEngine
        const session = {
            exam: (user.target_exam || 'JEE').toLowerCase(),
            subject: 'Physics',
            chapter: 'Nuclei',
            topic: '',
            currentLevel: 1,
            attemptedQuestionIds: []
        };

        const JSONLoader = require('./src/utils/jsonLoader');
        console.log('Testing JSONLoader.getQuestion with Nuclei chapter...');
        const question = JSONLoader.getQuestion({
            exam: session.exam,
            subject: session.subject,
            chapter: session.chapter,
            topic: session.topic,
            difficulty: 'easy'
        });

        if (question) {
            console.log('Success! Found Question:', question.question_id);
            console.log('Question Chapter:', question.chapter);
            console.log('Question Text:', question.text.substring(0, 50));
        } else {
            console.log('Failed to find Nuclei question.');
        }

        console.log('\nTesting with empty chapter/topic (Subject-only)...');
        const subOnly = JSONLoader.getQuestion({
            exam: session.exam,
            subject: session.subject,
            difficulty: 'easy'
        });
        console.log('Subject-only Result:', subOnly ? `${subOnly.question_id} (${subOnly.chapter})` : 'NULL');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
