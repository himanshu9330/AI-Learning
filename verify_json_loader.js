const JSONLoader = require('./backend/src/utils/jsonLoader');

// Test 1: Load a JEE Math question
console.log('--- Test 1: JEE Math ---');
const q1 = JSONLoader.getQuestion({
    exam: 'jee',
    subject: 'Mathematics'
});
console.log('Found question:', q1 ? q1.question_id : 'None');

// Test 2: Load a NEET Biology question with chapter filter
console.log('\n--- Test 2: NEET Bio (Cell Biology) ---');
const q2 = JSONLoader.getQuestion({
    exam: 'neet',
    subject: 'Biology',
    chapter: 'Cell Biology'
});
console.log('Found question:', q2 ? q2.question_id : 'None');

// Test 3: Exclude an ID
console.log('\n--- Test 3: Exclude jee_math_001 ---');
const q3 = JSONLoader.getQuestion({
    exam: 'jee',
    subject: 'Mathematics',
    excludeIds: ['jee_math_001']
});
console.log('Found question (should not be 001):', q3 ? q3.question_id : 'None');

// Test 4: Invalid subject
console.log('\n--- Test 4: Invalid Subject ---');
const q4 = JSONLoader.getQuestion({
    exam: 'jee',
    subject: 'History'
});
console.log('Found question (should be null):', q4);
