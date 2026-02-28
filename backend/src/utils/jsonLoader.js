const fs = require('fs');
const path = require('path');

/**
 * JSON Loader Utility
 * Loads questions from exam-specific JSON files and filters them based on criteria.
 */
class JSONLoader {
    /**
     * Load a question from JSON data based on exam, subject, chapter, and difficulty
     * @param {Object} params - Selection parameters
     * @param {String} params.exam - Exam type (jee, neet, class12)
     * @param {String} params.subject - Subject name
     * @param {String} [params.chapter] - Optional chapter name
     * @param {String} [params.topic] - Optional topic name
     * @param {String} [params.difficulty] - Optional difficulty level (easy, medium, hard)
     * @param {Array} [params.excludeIds] - Array of question IDs to ignore
     * @returns {Object|null} A random filtered question or null if none found
     */
    static getQuestion({ exam, subject, chapter, topic, difficulty, excludeIds = [] }) {
        try {
            // 1. Resolve file path
            let fileName = `${exam.toLowerCase()}_questions.json`;
            let filePath = path.join(__dirname, '../../data', fileName);

            // Fallback for BITSAT or missing files to JEE
            if (!fs.existsSync(filePath)) {
                console.log(`[INFO] Exam file ${fileName} not found, falling back to jee_questions.json`);
                fileName = 'jee_questions.json';
                filePath = path.join(__dirname, '../../data', fileName);
            }

            // 2. Read and parse file
            if (!fs.existsSync(filePath)) {
                console.error(`Question file not found: ${filePath}`);
                return null;
            }

            const rawData = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(rawData);

            if (!data.questions || !Array.isArray(data.questions)) {
                return null;
            }

            // 3. Filter questions
            console.log(`[DEBUG] JSONLoader: exam=${exam}, subject=${subject}, chapter=${chapter}, topic=${topic}, diff=${difficulty}`);
            let filtered = data.questions.filter(q => {
                // Match subject (case-insensitive)
                const subjectMatch = q.subject.toLowerCase().trim() === subject.toLowerCase().trim();
                if (!subjectMatch) return false;

                // Match chapter if provided
                if (chapter && chapter.trim() !== "") {
                    if (!q.chapter) {
                        return false;
                    }
                    if (q.chapter.toLowerCase().trim() !== chapter.toLowerCase().trim()) {
                        // console.log(`[DEBUG] Chapter mismatch: expected ${chapter}, got ${q.chapter}`);
                        return false;
                    }
                }

                // Match topic if provided (checks if topic exists in topic_tags)
                if (topic && topic.trim() !== "") {
                    const topicMatch = q.topic_tags && q.topic_tags.some(t => t.toLowerCase().trim() === topic.toLowerCase().trim());
                    if (!topicMatch) {
                        // console.log(`[DEBUG] Topic mismatch: expected ${topic}, tags: ${JSON.stringify(q.topic_tags)}`);
                        return false;
                    }
                }

                // Match difficulty if provided
                const diffMatch = !difficulty || q.difficulty.toLowerCase().trim() === difficulty.toLowerCase().trim();
                if (!diffMatch) return false;

                // Exclude attempted IDs
                if (excludeIds.includes(q.question_id)) return false;

                console.log(`[DEBUG] Question MATCHED: ${q.question_id} (${q.chapter} - ${q.topic_tags?.[0]})`);
                return true;
            });

            console.log(`[DEBUG] JSONLoader found ${filtered.length} matches`);

            // 4. Return a random question from filtered list
            if (filtered.length === 0) {
                console.log(`[DEBUG] No matches for: exam=${exam}, subject=${subject}, diff=${difficulty}`);
                return null;
            }

            const randomIndex = Math.floor(Math.random() * filtered.length);
            return filtered[randomIndex];

        } catch (error) {
            console.error('Error in JSONLoader.getQuestion:', error);
            return null;
        }
    }

    /**
     * Get a specific question by ID
     */
    static getQuestionById(exam, questionId) {
        try {
            const fileName = `${exam.toLowerCase()}_questions.json`;
            const filePath = path.join(__dirname, '../../data', fileName);

            if (!fs.existsSync(filePath)) return null;

            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return data.questions.find(q => q.question_id === questionId) || null;
        } catch (error) {
            console.error('Error in JSONLoader.getQuestionById:', error);
            return null;
        }
    }
}

module.exports = JSONLoader;
