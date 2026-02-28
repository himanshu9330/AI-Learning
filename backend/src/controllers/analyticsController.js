const asyncHandler = require('../utils/asyncHandler');
const analyticsService = require('../services/analyticsService');
const TopicMastery = require('../models/TopicMastery');

/**
 * @desc    Get ability score history
 * @route   GET /api/v1/analytics/ability-history
 * @access  Private
 */
const getAbilityHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { days } = req.query;

    const history = await analyticsService.getAbilityHistory(
        userId,
        days ? parseInt(days) : 30
    );

    res.status(200).json({
        status: 'success',
        data: {
            history,
            count: history.length
        }
    });
});

/**
 * @desc    Get topic mastery growth
 * @route   GET /api/v1/analytics/topic-growth
 * @access  Private
 */
const getTopicGrowth = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { topic } = req.query;

    const growth = await analyticsService.getTopicGrowth(userId, topic);

    res.status(200).json({
        status: 'success',
        data: {
            topics: growth
        }
    });
});

/**
 * @desc    Get performance statistics
 * @route   GET /api/v1/analytics/performance
 * @access  Private
 */
const simpleCache = require('../utils/simpleCache');

const getPerformanceStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const cacheKey = `performance_${userId}`;

    let stats = simpleCache.get(cacheKey);
    if (!stats) {
        stats = await analyticsService.getPerformanceStats(userId);
        simpleCache.set(cacheKey, stats);
    }

    res.status(200).json({
        status: 'success',
        data: stats
    });
});

/**
 * @desc    Get improvement metrics
 * @route   GET /api/v1/analytics/improvement
 * @access  Private
 */
const getImprovementMetrics = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const metrics = await analyticsService.getImprovementMetrics(userId);

    res.status(200).json({
        status: 'success',
        data: metrics
    });
});

/**
 * @desc    Get user's topic mastery grouped by subject
 * @route   GET /api/v1/analytics/topic-mastery
 */
const getTopicMastery = asyncHandler(async (req, res) => {
    const mastery = await analyticsService.getTopicMasterySummary(req.user.id);
    res.status(200).json({
        status: 'success',
        data: mastery
    });
});

/**
 * @desc    Get user's weak topics
 * @route   GET /api/v1/analytics/weak-topics
 */
const getWeakTopics = asyncHandler(async (req, res) => {
    const weakTopics = await TopicMastery.getWeakTopics(req.user.id, 10);
    res.status(200).json({
        status: 'success',
        data: weakTopics
    });
});

/**
 * @desc    Get consistency statistics
 * @route   GET /api/v1/analytics/consistency
 */
const getConsistencyStats = asyncHandler(async (req, res) => {
    const stats = await analyticsService.getConsistencyStats(req.user.id);
    res.status(200).json({
        status: 'success',
        data: stats
    });
});

module.exports = {
    getAbilityHistory,
    getTopicGrowth,
    getPerformanceStats,
    getImprovementMetrics,
    getTopicMastery,
    getWeakTopics,
    getConsistencyStats
};
