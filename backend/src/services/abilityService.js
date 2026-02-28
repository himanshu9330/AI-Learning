const User = require('../models/User');
const TopicMastery = require('../models/TopicMastery');
const Roadmap = require('../models/Roadmap');
const config = require('../config/abilityConfig');

/**
 * Service to handle all ability score calculations and updates
 */
class AbilityService {
    /**
     * Recalculate and update the user's ability score
     * @param {string} userId - User ID to calculate for
     */
    async updateAbilityScore(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) throw new Error('User not found');

            // 1. Component: Test Performance (50%)
            const testPerformanceScore = await this.calculateTestPerformance(userId);

            // 2. Component: Roadmap Progress (20%)
            const roadmapProgressScore = await this.calculateRoadmapProgress(userId);

            // 3. Component: Consistency (20%)
            const consistencyScore = await this.calculateConsistency(user);

            // 4. Component: Study Time (10%)
            const studyTimeScore = await this.calculateStudyTimePerformance(userId);

            // Final Weighted Raw Score
            const { WEIGHTS } = config;
            const rawScore = (
                (testPerformanceScore * WEIGHTS.TEST_PERFORMANCE) +
                (roadmapProgressScore * WEIGHTS.ROADMAP_PROGRESS) +
                (consistencyScore * WEIGHTS.CONSISTENCY) +
                (studyTimeScore * WEIGHTS.TIME_ON_TASK)
            );

            // Apply EMA Smoothing
            // Formula: EMA_current = (EMA_previous * (1 - Alpha)) + (New_Score * Alpha)
            const prevEMA = user.ema_ability_score || rawScore;
            const newEMA = (prevEMA * (1 - config.EMA_ALPHA)) + (rawScore * config.EMA_ALPHA);

            // Update User Model
            user.ability_score = rawScore;
            user.ema_ability_score = newEMA;
            await user.save();

            return {
                rawScore,
                emaScore: newEMA,
                components: {
                    testPerformance: testPerformanceScore,
                    roadmapProgress: roadmapProgressScore,
                    consistency: consistencyScore,
                    studyTime: studyTimeScore
                }
            };
        } catch (error) {
            console.error('Error updating ability score:', error);
            throw error;
        }
    }

    /**
     * Calculates test performance based on difficulty-weighted mastery and recency decay
     */
    async calculateTestPerformance(userId) {
        const masteries = await TopicMastery.find({ user_id: userId });
        if (masteries.length === 0) return 0.3; // Default baseline

        let weightedSum = 0;
        let count = 0;

        masteries.forEach(m => {
            // Apply Bayesian smoothing if attempts are low
            const threshold = config.TEST_CONSTANTS.MIN_ATTEMPT_THRESHOLD;
            const prior = config.TEST_CONSTANTS.BAYESIAN_PRIOR;

            // smoothed = (total_correct + prior_correct) / (total_attempts + prior_attempts)
            // Here we use weights:
            const smoothedMastery = (m.total_weight_correct + (prior * threshold)) /
                (m.total_weight_attempted + threshold);

            weightedSum += smoothedMastery;
            count++;
        });

        return weightedSum / count;
    }

    /**
     * Calculates roadmap progress based on importance-weighted completion
     */
    async calculateRoadmapProgress(userId) {
        // This relies on having a "Roadmap" or "Topics" list with importance
        // For now, we use completed topics count vs total expected
        const user = await User.findById(userId);
        if (!user || user.completed_topics.length === 0) return 0.1;

        // Placeholder logic: 
        // In a real system, we'd compare user.completed_topics against the curriculum total
        // Let's assume a baseline divisor for now (e.g., 100 topics)
        const totalTopics = 100;
        const progress = Math.min(user.completed_topics.length / totalTopics, 1);

        return progress;
    }

    /**
     * Calculates consistency score over last 14 days
     * Includes streak bonus and negative effect for partial completion
     */
    async calculateConsistency(user) {
        const { CONSISTENCY_CONSTANTS } = config;

        // Completion rate: Average of stored completion percentage over 14 days
        const rates = user.consistency_stats?.daily_completion_rates || [];
        if (rates.length === 0) return 0;

        const avgCompletion = rates.reduce((a, b) => a + b, 0) / rates.length;

        // Streak Bonus: 1% per day, capped at 10%
        const streakBonus = Math.min(
            user.streak * CONSISTENCY_CONSTANTS.STREAK_BONUS_FACTOR,
            CONSISTENCY_CONSTANTS.MAX_STREAK_BONUS
        );

        // Final consistency is avg completion + streak bonus
        // Note: Partial completion (avgCompletion < 1) naturally lowers this
        return Math.min(avgCompletion + streakBonus, 1);
    }

    /**
     * Calculates Study Time Performance (Actual vs Estimated)
     */
    async calculateStudyTimePerformance(userId) {
        // Placeholder: Needs integration with a StudyLog model or similar
        // For now, return a baseline
        return 0.5;
    }

    /**
     * Update consistency statistics after daily tasks are processed
     * @param {string} userId 
     * @param {number} completionRate (0-1)
     */
    async updateConsistency(userId, completionRate) {
        const user = await User.findById(userId);
        if (!user) return;

        const maxLookback = config.CONSISTENCY_CONSTANTS.LOOKBACK_DAYS;

        // Update daily rates (circular buffer style or just push/shift)
        if (!user.consistency_stats) {
            user.consistency_stats = { daily_completion_rates: [], weekly_consistency: 0 };
        }

        user.consistency_stats.daily_completion_rates.push(completionRate);
        if (user.consistency_stats.daily_completion_rates.length > maxLookback) {
            user.consistency_stats.daily_completion_rates.shift();
        }

        // Update Streak
        const today = new Date().setHours(0, 0, 0, 0);
        const lastActive = user.last_active_date ? new Date(user.last_active_date).setHours(0, 0, 0, 0) : null;

        if (lastActive === today) {
            // Already updated today, maybe adjust if they completed MORE tasks
        } else if (lastActive === today - (24 * 60 * 60 * 1000)) {
            // Active yesterday, increment streak if completion is sufficient (e.g., > 50%)
            if (completionRate > 0.5) user.streak += 1;
        } else {
            // Gap in activity, reset streak unless completion is high today
            user.streak = completionRate > 0.5 ? 1 : 0;
        }

        user.last_active_date = new Date();
        await user.save();

        // Trigger ability score update
        await this.updateAbilityScore(userId);
    }
}

module.exports = new AbilityService();
