const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('_questions.json'));

const metadata = {};

files.forEach(file => {
    try {
        const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
        const exam = content.exam.toUpperCase();

        if (!metadata[exam]) metadata[exam] = {};

        content.questions.forEach(q => {
            if (!metadata[exam][q.subject]) {
                metadata[exam][q.subject] = {
                    chapters: new Set(),
                    topics: new Set()
                };
            }
            if (q.chapter) metadata[exam][q.subject].chapters.add(q.chapter.trim());
            if (q.topic_tags) {
                q.topic_tags.forEach(tag => metadata[exam][q.subject].topics.add(tag.trim()));
            }
        });
    } catch (e) { }
});

Object.keys(metadata).forEach(exam => {
    console.log(`EXAM: ${exam}`);
    Object.keys(metadata[exam]).forEach(sub => {
        console.log(`  SUB: ${sub}`);
        console.log(`    CHAPTERS: ${Array.from(metadata[exam][sub].chapters).sort().join(', ')}`);
    });
});
