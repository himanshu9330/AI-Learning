const axios = require('axios');
const AppError = require('../utils/AppError');

class AIService {
    constructor() {
        this.baseURL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        this.timeout = 10000; // 10 seconds
    }

    /**
     * Generate AI explanation for incorrect answer
     * @param {Object} data - Explanation request data
     * @returns {Object} AI-generated explanation
     */
    async generateExplanation(data) {
        try {
            const response = await axios.post(
                `${this.baseURL}/api/ai/explain`,
                {
                    question_text: data.question_text,
                    correct_answer: data.correct_answer,
                    student_answer: data.student_answer,
                    topic: data.topic,
                    mastery_level: data.mastery_level,
                    difficulty: data.difficulty
                },
                {
                    timeout: this.timeout,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('AI Service error:', error.message);

            // Return fallback response if AI service fails
            return this.getFallbackExplanation(data);
        }
    }

    /**
     * Generate practice questions
     * @param {Object} data - Practice request data
     * @returns {Object} Generated practice questions
     */
    async generatePracticeQuestions(data) {
        try {
            const response = await axios.post(
                `${this.baseURL}/api/ai/practice`,
                {
                    topic: data.topic,
                    difficulty: data.difficulty,
                    count: data.count || 5,
                    mastery_level: data.mastery_level
                },
                {
                    timeout: this.timeout,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('AI Service error:', error.message);
            throw new AppError('Failed to generate practice questions', 500);
        }
    }

    /**
     * Check if AI service is available
     * @returns {Boolean} Service availability
     */
    async isAvailable() {
        try {
            const response = await axios.get(`${this.baseURL}/health`, {
                timeout: 3000
            });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    /**
     * Prioritize topics based on performance and importance
     * @param {Object} data - Priority request data
     * @returns {Object} Prioritized topics
     */
    async prioritizeTopics(data) {
        try {
            const response = await axios.post(
                `${this.baseURL}/api/ai/prioritize-topics`,
                {
                    topics: data.topics,
                    subject: data.subject
                },
                {
                    timeout: this.timeout,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('AI Service prioritization error:', error.message);
            // Fallback: Return original topics with neutral priority if AI fails
            return {
                prioritized_topics: data.topics.map(t => ({
                    topic: t.topic,
                    priority_score: 0.5,
                    importance_score: 0.5,
                    reasoning: 'Fallback due to AI service error.'
                }))
            };
        }
    }

    /**
     * Summarize a YouTube video
     * @param {String} youtube_url - YouTube video URL
     * @returns {Object} Structured video summary
     */
    async summarizeVideo(youtube_url) {
        try {
            const response = await axios.post(
                `${this.baseURL}/api/ai/summarize-video`,
                { youtube_url },
                {
                    timeout: 60000, // Longer timeout for summarization (60s)
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('AI Service summarization error:', error.message);
            const status = error.response?.status || 500;
            const message = error.response?.data?.detail || 'Failed to summarize video';
            throw new AppError(message, status);
        }
    }

    async generateRoadmap(data) {
        try {
            const response = await axios.post(
                `${this.baseURL}/api/ai/generate-roadmap`,
                {
                    topics: data.topics,
                    subject: data.subject
                },
                {
                    timeout: 20000, // 20 seconds for full plan
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('AI Service roadmap error:', error.message);
            throw new AppError('Failed to generate AI roadmap', 500);
        }
    }

    /**
     * Generate an adaptive timetable
     * @param {Object} data - Timetable request data
     * @returns {Object} JSON schedule array
     */
    async generateTimetable(data) {
        try {
            const response = await axios.post(
                `${this.baseURL}/api/ai/generate-timetable`,
                {
                    subjects: data.subjects,
                    wake_time: data.wakeTime,
                    sleep_time: data.sleepTime,
                    meal_times: data.mealTimes,
                    profile: data.profile,
                    coaching_time: data.coachingTime,
                    extras: data.extras
                },
                {
                    timeout: 90000, // 90 seconds for full 7-day schedule generation
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('AI Service timetable error:', error.message);
            const status = error.response?.status || 500;
            const message = error.response?.data?.detail || 'Failed to generate timetable';
            throw new AppError(message, status);
        }
    }

    /**
     * Fallback explanation when AI service is unavailable
     * @param {Object} data - Original request data
     * @returns {Object} Basic explanation
     */
    getFallbackExplanation(data) {
        return {
            explanation: `The correct answer is: ${data.correct_answer}. Review the ${data.topic} concepts to understand this better.`,
            mistake_reason: 'This is a common mistake. Take time to review the fundamentals.',
            step_by_step_solution: 'AI service is currently unavailable. Please refer to your study materials for detailed solutions.',
            micro_practice_questions: [],
            recommended_next_step: `Practice more questions on ${data.topic} to improve your understanding.`,
            youtube_link: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(data.topic + ' tutorial')
        };
    }
}

module.exports = new AIService();
