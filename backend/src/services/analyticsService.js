const Answer = require('../models/Answer');
const Test = require('../models/Test');
const TopicMastery = require('../models/TopicMastery');
const User = require('../models/User');
const AppError = require('../utils/AppError');

class AnalyticsService {
    /**
     * Get user's ability score history
     * @param {String} userId - User ID
     * @param {Number} days - Number of days to look back
     * @returns {Array} Ability score history
     */
    async getAbilityHistory(userId, days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const tests = await Test.find({
            user_id: userId,
            createdAt: { $gte: startDate },
            status: 'completed'
        }).sort({ createdAt: 1 });

        return tests.map(test => ({
            date: test.createdAt,
            ability_before: test.ability_before,
            ability_after: test.ability_after,
            ability_score: test.ability_after || test.ability_before, // Map to frontend expectation
            change: test.ability_after ? test.ability_after - test.ability_before : 0
        }));
    }

    /**
     * Get topic mastery growth over time
     * @param {String} userId - User ID
     * @param {String} topic - Optional topic filter
     * @returns {Object} Topic growth data
     */
    async getTopicGrowth(userId, topic = null) {
        const query = { user_id: userId };
        if (topic) {
            query.topic = topic;
        }

        const masteryData = await TopicMastery.find(query).sort({ last_attempt_date: -1 });
        console.log(`[DEBUG] getTopicGrowth for user ${userId} returned ${masteryData.length} topics`);

        return masteryData.map(m => ({
            topic: m.topic,
            subject: m.subject,
            mastery_score: m.mastery_score !== undefined ? m.mastery_score : (m.mastery_percentage / 100),
            mastery_percentage: m.mastery_percentage,
            attempts: m.attempts,
            classification: m.classification,
            last_attempt_date: m.last_attempt_date
        }));
    }

    /**
     * Get overall performance statistics
     * @param {String} userId - User ID
     * @returns {Object} Performance stats
     */
    async getPerformanceStats(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Get total tests
        const totalTests = await Test.countDocuments({
            user_id: userId,
            status: 'completed'
        });

        // Get average score
        const testStats = await Test.aggregate([
            {
                $match: {
                    user_id: user._id,
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: '$final_score' },
                    avgAccuracy: { $avg: '$final_score' },
                    totalQuestions: { $sum: '$questions_attempted' },
                    totalCorrect: { $sum: '$correct_answers' }
                }
            }
        ]);

        // Get total answers
        const totalAnswers = await Answer.countDocuments({ user_id: userId });
        const correctAnswers = await Answer.countDocuments({
            user_id: userId,
            correct: true
        });

        // Get average response time
        const responseTimeStats = await Answer.aggregate([
            { $match: { user_id: user._id } },
            {
                $group: {
                    _id: null,
                    avgResponseTime: { $avg: '$response_time_ms' }
                }
            }
        ]);

        // Get topic mastery summary
        const topicStats = await TopicMastery.aggregate([
            { $match: { user_id: user._id } },
            {
                $group: {
                    _id: '$classification',
                    count: { $sum: 1 }
                }
            }
        ]);

        const topicSummary = {
            weak: 0,
            moderate: 0,
            strong: 0,
            insufficient_data: 0
        };

        topicStats.forEach(stat => {
            topicSummary[stat._id] = stat.count;
        });

        return {
            user: {
                name: user.name,
                ability_score: user.ability_score,
                ema_ability_score: user.ema_ability_score,
                streak: user.streak,
                ability_level: user.ability_level,
                grade: user.grade,
                target_exam: user.target_exam
            },
            tests: {
                total: totalTests,
                average_score: testStats[0]?.avgScore || 0,
                average_accuracy: testStats[0]?.avgAccuracy || 0,
                total_questions: testStats[0]?.totalQuestions || 0,
                total_correct: testStats[0]?.totalCorrect || 0
            },
            answers: {
                total: totalAnswers,
                correct: correctAnswers,
                overall_accuracy: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
                avg_response_time_ms: responseTimeStats[0]?.avgResponseTime || 0
            },
            topics: {
                total: Object.values(topicSummary).reduce((a, b) => a + b, 0),
                ...topicSummary
            }
        };
    }

    /**
     * Get improvement metrics
     * @param {String} userId - User ID
     * @returns {Object} Improvement data
     */
    async getImprovementMetrics(userId) {
        // Get first and latest tests
        const firstTest = await Test.findOne({
            user_id: userId,
            status: 'completed'
        }).sort({ createdAt: 1 });

        const latestTest = await Test.findOne({
            user_id: userId,
            status: 'completed'
        }).sort({ createdAt: -1 });

        if (!firstTest || !latestTest) {
            return {
                ability_improvement: 0,
                score_improvement: 0,
                tests_completed: 0
            };
        }

        const testsCompleted = await Test.countDocuments({
            user_id: userId,
            status: 'completed'
        });

        return {
            ability_improvement: latestTest.ability_after - firstTest.ability_before,
            score_improvement: latestTest.final_score - firstTest.final_score,
            tests_completed: testsCompleted,
            first_test_date: firstTest.createdAt,
            latest_test_date: latestTest.createdAt
        };
    }

    /**
     * Get consistency stats
     */
    async getConsistencyStats(userId) {
        const user = await User.findById(userId).select('streak last_active_date consistency_stats');
        if (!user) throw new AppError('User not found', 404);

        return {
            streak: user.streak,
            last_active_date: user.last_active_date,
            daily_completion_rates: user.consistency_stats?.daily_completion_rates || []
        };
    }

    /**
     * Get optimized topic mastery list grouped by subject
     */
    async getTopicMasterySummary(userId) {
        return await TopicMastery.aggregate([
            { $match: { user_id: userId } },
            {
                $group: {
                    _id: "$subject",
                    topics: {
                        $push: {
                            topic: "$topic",
                            mastery: "$mastery_percentage",
                            mastery_score: "$mastery_score",
                            classification: "$classification",
                            attempts: "$attempts",
                            last_attempt: "$last_attempt_date"
                        }
                    },
                    avg_mastery: { $avg: "$mastery_percentage" }
                }
            },
            { $sort: { _id: 1 } }
        ]);
    }
}

module.exports = new AnalyticsService();
