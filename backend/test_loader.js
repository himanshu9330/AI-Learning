const JSONLoader = require('./src/utils/jsonLoader');
const path = require('path');

const result = JSONLoader.getQuestion({
    exam: 'neet',
    subject: 'Physics',
    difficulty: 'easy',
    excludeIds: []
});

console.log('Result:', result);

const allPhysics = JSONLoader.getQuestion({
    exam: 'neet',
    subject: 'Physics',
    excludeIds: []
});
console.log('Any Physics:', allPhysics);
