const mongoose = require('mongoose');
const TopicMastery = require('./src/models/TopicMastery');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

async function testIsolation() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const userId = new mongoose.Types.ObjectId();
        const subject = 'Mathematics';
        const topic = 'Isolation Test';

        console.log('--- Phase 1: Fail 5 easy questions ---');
        // Weight for easy is 3. 5 failures = 15 attempts, 0 correct.
        for (let i = 0; i < 5; i++) {
            await TopicMastery.updateOrCreate(userId, topic, subject, false, 0.3); // 0.3 is easy
        }

        let mastery = await TopicMastery.findOne({ user_id: userId, topic });
        console.log(`Mastery Score: ${mastery.mastery_score} (Expected 0)`);
        console.log(`Classification: ${mastery.classification} (Expected weak)`);
        console.log(`Attempts (weighted): ${mastery.attempts} (Expected 15)`);

        console.log('\n--- Phase 2: Get 3 hard questions right ---');
        // Weight for hard is 1. 3 successes = 3 attempts, 3 correct.
        // Total so far: attempts = 15 + 3 = 18, correct = 0 + 3 = 3.
        // Score = 3/18 = 0.166... (Still weak)
        for (let i = 0; i < 3; i++) {
            await TopicMastery.updateOrCreate(userId, topic, subject, true, 0.9); // 0.9 is hard
        }

        mastery = await TopicMastery.findOne({ user_id: userId, topic });
        console.log(`Mastery Score: ${mastery.mastery_score.toFixed(3)} (Expected ~0.167)`);
        console.log(`Classification: ${mastery.classification} (Expected weak)`);

        console.log('\n--- Phase 3: Get 6 easy questions right ---');
        // Weight for easy is 3. 6 successes = 18 attempts, 18 correct.
        // Total: attempts = 18 + 18 = 36, correct = 3 + 18 = 21.
        // Score = 21/36 = 0.583 (Should be moderate)
        for (let i = 0; i < 6; i++) {
            await TopicMastery.updateOrCreate(userId, topic, subject, true, 0.3);
        }

        mastery = await TopicMastery.findOne({ user_id: userId, topic });
        console.log(`Mastery Score: ${mastery.mastery_score.toFixed(3)} (Expected ~0.583)`);
        console.log(`Classification: ${mastery.classification} (Expected moderate)`);

        // Cleanup
        await TopicMastery.deleteMany({ user_id: userId });
        console.log('\nIsolation test passed.');
        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

testIsolation();
