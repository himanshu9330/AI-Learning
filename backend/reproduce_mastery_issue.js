const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const TopicMastery = require('./src/models/TopicMastery');
const masteryCalculator = require('./src/utils/masteryCalculator');
const User = require('./src/models/User');

async function reproduce() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find or create a test user
        let user = await User.findOne({ email: /test/i }) || await User.findOne();
        if (!user) {
            console.log('No user found');
            return;
        }
        const userId = user._id;

        const subject = 'Physics';
        const topic = 'ReproductionTopic-' + Date.now();
        const topicTags = [topic];

        console.log(`\n--- Test 1: Single Incorrect Attempt for chapter: ${subject}-${topic} ---`);
        await masteryCalculator.updateTopicMastery(userId, subject, topic, [], false, 0.3); // Wrong on Easy, no topic tags

        let mastery = await TopicMastery.findOne({ user_id: userId, topic: topic });
        console.log('Mastery Record after 1st attempt:');
        console.log(JSON.stringify(mastery, null, 2));
        console.log('Classification:', mastery.classification);

        console.log(`\n--- Test 2: Second Incorrect Attempt ---`);
        await masteryCalculator.updateTopicMastery(userId, subject, topic, [], false, 0.3);

        mastery = await TopicMastery.findOne({ user_id: userId, topic: topic });
        console.log('Mastery Record after 2nd attempt:');
        console.log('Classification:', mastery.classification);

        console.log(`\n--- Test 3: Third Incorrect Attempt (Boundary) ---`);
        await masteryCalculator.updateTopicMastery(userId, subject, topic, [], false, 0.3);

        mastery = await TopicMastery.findOne({ user_id: userId, topic: topic });
        console.log('Mastery Record after 3rd attempt:');
        console.log('Classification:', mastery.classification);

        // Check summary
        const summary = await masteryCalculator.getUserMasterySummary(userId);
        console.log('\n--- User Mastery Summary (via MasteryCalculator) ---');
        console.log(JSON.stringify(summary, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

reproduce();
