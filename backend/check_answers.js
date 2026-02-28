const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Answer = require('./src/models/Answer');

async function checkAnswers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-learning');

        const answers = await Answer.find().sort({ createdAt: -1 }).limit(10);
        console.log(`FOUND_ANSWERS=${answers.length}`);

        answers.forEach(a => {
            console.log(`AN_START`);
            console.log(`QID=${a.question_id}`);
            console.log(`SUB=${a.subject}`);
            console.log(`CHAP=${a.chapter}`);
            console.log(`CORR=${a.is_correct}`);
            console.log(`AN_END`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAnswers();
