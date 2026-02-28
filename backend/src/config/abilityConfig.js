/**
 * Ability Score Configuration
 * Centralized weights and constants for the ability scoring system.
 */
module.exports = {
    // Component Weights (Must sum to 1.0)
    WEIGHTS: {
        TEST_PERFORMANCE: 0.50,
        ROADMAP_PROGRESS: 0.20,
        CONSISTENCY: 0.20,
        TIME_ON_TASK: 0.10
    },

    // Test Performance Constants
    TEST_CONSTANTS: {
        DIFFICULTY_WEIGHTS: {
            easy: 1,
            medium: 2,
            hard: 3
        },
        RECENCY_DECAY_RATE: 0.05, // 5% decay per day of inactivity
        MIN_ATTEMPT_THRESHOLD: 5,  // Minimum attempts for reliable mastery
        BAYESIAN_PRIOR: 0.5        // Prior for smoothing (0-1)
    },

    // Consistency Constants
    CONSISTENCY_CONSTANTS: {
        STREAK_BONUS_FACTOR: 0.01,  // 1% bonus per day of streak (max 10%)
        MAX_STREAK_BONUS: 0.10,
        LOOKBACK_DAYS: 14           // Calculate completion over last 14 days
    },

    // EMA Balancing
    EMA_ALPHA: 0.3, // Impact of new score on the stored average (0-1)

    // Topic Mastery Thresholds
    MASTERY_THRESHOLDS: {
        INSUFFICIENT_DATA: 3, // Minimum attempts before classifying
        WEAK_EASY_ACCURACY: 0.50, // Below 50% = Weak
        MODERATE: 0.60,
        STRONG: 0.80
    }
};
