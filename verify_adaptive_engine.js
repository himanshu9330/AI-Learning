const AdaptiveEngine = require('./backend/src/services/adaptiveEngine');

// Mock Session
const session = {
    exam: 'jee',
    subject: 'Mathematics',
    currentLevel: 1, // Easy
    attemptedQuestionIds: [],
    batchCount: 0,
    batchTotal: 2, // Small batch for testing
    totalScore: 0
};

async function testEngine() {
    console.log('--- Initial Session ---');
    console.log(session);

    // 1. Select Question
    console.log('\n--- Step 1: Select Question ---');
    const q1 = await AdaptiveEngine.selectRandomQuestion(session);
    console.log('Selected:', q1 ? q1.question_id : 'None');

    // 2. Record Correct Answer
    console.log('\n--- Step 2: Record Answer (Correct) ---');
    if (q1) {
        const isCorrect = await AdaptiveEngine.recordAnswer(session, q1, q1.correct_option);
        console.log('Is Correct:', isCorrect);
        console.log('Batch Count:', session.batchCount);
        console.log('Total Score:', session.totalScore);
    }

    // 3. Select Another
    console.log('\n--- Step 3: Select Another ---');
    const q2 = await AdaptiveEngine.selectRandomQuestion(session);
    console.log('Selected:', q2 ? q2.question_id : 'None');

    // 4. Record Another Correct Answer
    console.log('\n--- Step 4: Record Answer (Correct) ---');
    if (q2) {
        await AdaptiveEngine.recordAnswer(session, q2, q2.correct_option);
    }

    // 5. Evaluate Batch (should promote)
    console.log('\n--- Step 5: Evaluate Batch ---');
    const result = await AdaptiveEngine.evaluateBatch(session);
    console.log('Evaluation Result:', result);
    console.log('New Session Level:', session.currentLevel);
    console.log('Reset Batch Count:', session.batchCount);
}

testEngine().catch(console.error);
