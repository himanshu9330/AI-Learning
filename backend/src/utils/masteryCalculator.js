/**
 * Topic Mastery Calculator
 * Handles topic mastery score calculations and classifications
 */

const TopicMastery = require('../models/TopicMastery');

class MasteryCalculator {
    /**
     * Update mastery scores for all topics in a question
     * @param {String} userId - User ID
     * @param {String} subject - Subject name
     * @param {String} chapter - Chapter name
     * @param {Array} topicTags - Array of topic tags from question
     * @param {Boolean} isCorrect - Whether answer was correct
     * @param {Number} difficulty - Numerical difficulty
     * @returns {Array} Updated mastery records
     */
    async updateTopicMastery(userId, subject, chapter, topicTags, isCorrect, difficulty = 0.5) {
        const updatedMasteries = [];

        // 1. Update Chapter Mastery (Treat chapter as a topic for broad tracking)
        if (chapter) {
            const chapterMastery = await TopicMastery.updateOrCreate(userId, chapter, subject, isCorrect, difficulty);
            updatedMasteries.push(chapterMastery);
        }

        // 2. Update Topic Mastery for specific tags
        if (topicTags && Array.isArray(topicTags)) {
            for (const topic of topicTags) {
                const mastery = await TopicMastery.updateOrCreate(userId, topic, subject, isCorrect, difficulty);
                updatedMasteries.push(mastery);
            }
        }

        return updatedMasteries;
    }

    /**
     * Calculate mastery score
     * @param {Number} correctAttempts - Number of correct attempts
     * @param {Number} totalAttempts - Total attempts
     * @returns {Number} Mastery score (0-1)
     */
    calculateMasteryScore(correctAttempts, totalAttempts) {
        if (totalAttempts === 0) return 0;
        return correctAttempts / totalAttempts;
    }

    /**
     * Classify mastery level
     * @param {Number} masteryScore - Mastery score (0-1)
     * @returns {String} Classification: 'weak', 'moderate', or 'strong'
     */
    classifyMastery(masteryScore) {
        if (masteryScore < 0.4) return 'weak';
        if (masteryScore < 0.7) return 'moderate';
        return 'strong';
    }

    /**
     * Get weak topics for a user
     * @param {String} userId - User ID
     * @param {Number} limit - Maximum number of topics to return
     * @returns {Array} Weak topics sorted by mastery score
     */
    async getWeakTopics(userId, limit = 3) {
        return await TopicMastery.getWeakTopics(userId, limit);
    }

    /**
     * Get all topic mastery for a user
     * @param {String} userId - User ID
     * @returns {Object} Mastery summary with classifications
     */
    async getUserMasterySummary(userId) {
        const allMastery = await TopicMastery.getUserMastery(userId);

        const summary = {
            total_topics: allMastery.length,
            weak: [],
            moderate: [],
            strong: [],
            average_mastery: 0
        };

        let totalScore = 0;

        for (const mastery of allMastery) {
            totalScore += mastery.mastery_score || (mastery.mastery_percentage / 100) || 0;

            if (mastery.classification === 'weak') {
                summary.weak.push(mastery);
            } else if (mastery.classification === 'moderate') {
                summary.moderate.push(mastery);
            } else {
                summary.strong.push(mastery);
            }
        }

        summary.average_mastery = allMastery.length > 0
            ? totalScore / allMastery.length
            : 0;

        return summary;
    }

    /**
     * Calculate topic improvement over time
     * @param {String} userId - User ID
     * @param {String} topic - Topic name
     * @param {Number} days - Number of days to look back
     * @returns {Object} Improvement metrics
     */
    async calculateTopicImprovement(userId, topic, days = 30) {
        const mastery = await TopicMastery.findOne({ user_id: userId, topic });

        if (!mastery) {
            return {
                topic,
                current_mastery: 0,
                improvement: 0,
                status: 'not_started'
            };
        }

        // Simple improvement calculation
        // In production, you'd track historical mastery scores
        const improvement = mastery.mastery_score - 0.5; // Assuming 0.5 starting point

        return {
            topic,
            current_mastery: mastery.mastery_score,
            attempts: mastery.attempts,
            classification: mastery.classification,
            improvement: improvement,
            status: improvement > 0 ? 'improving' : 'needs_work'
        };
    }

    /**
     * Get recommended focus topics
     * @param {String} userId - User ID
     * @returns {Array} Topics that need focus
     */
    async getRecommendedFocusTopics(userId) {
        const weakTopics = await this.getWeakTopics(userId, 5);

        return weakTopics.map(mastery => ({
            topic: mastery.topic,
            mastery_score: mastery.mastery_score,
            attempts: mastery.attempts,
            priority: this.calculatePriority(mastery),
            recommended_practice_count: this.getRecommendedPracticeCount(mastery.mastery_score)
        }));
    }

    /**
     * Calculate priority for a topic
     * @param {Object} mastery - Mastery object
     * @returns {String} Priority level
     */
    calculatePriority(mastery) {
        if (mastery.mastery_score < 0.2) return 'critical';
        if (mastery.mastery_score < 0.4) return 'high';
        if (mastery.mastery_score < 0.6) return 'medium';
        return 'low';
    }

    /**
     * Get recommended practice question count
     * @param {Number} masteryScore - Current mastery score
     * @returns {Number} Recommended number of practice questions
     */
    getRecommendedPracticeCount(masteryScore) {
        if (masteryScore < 0.3) return 20;
        if (masteryScore < 0.5) return 15;
        if (masteryScore < 0.7) return 10;
        return 5;
    }
}

module.exports = new MasteryCalculator();
