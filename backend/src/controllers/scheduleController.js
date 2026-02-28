const asyncHandler = require('../utils/asyncHandler');
const scheduleService = require('../services/scheduleService');
const User = require('../models/User');
const abilityService = require('../services/abilityService');

/**
 * @desc    Generate daily schedule
 * @route   POST /api/schedule/generate
 */
const generateSchedule = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const schedule = await scheduleService.generateDailySchedule(userId);

    res.status(200).json({
        status: 'success',
        data: schedule
    });
});

/**
 * @desc    Get today's schedule
 * @route   GET /api/schedule/today
 */
const getTodaySchedule = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const schedule = await scheduleService.getTodaySchedule(userId);

    if (!schedule) {
        return res.status(404).json({
            status: 'fail',
            message: 'No schedule found for today. Please generate one.'
        });
    }

    res.status(200).json({
        status: 'success',
        data: schedule
    });
});

/**
 * @desc    Complete a specific task in the schedule
 * @route   PATCH /api/schedule/complete-task/:taskId
 */
const completeTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.id;

    const schedule = await scheduleService.completeTask(userId, taskId);

    res.status(200).json({
        status: 'success',
        data: schedule
    });
});

/**
 * @desc    Mark a topic as completely finished
 * @route   PATCH /api/schedule/mark-topic-complete
 */
const markTopicComplete = asyncHandler(async (req, res) => {
    const { topic, subject } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });

    // Add to completed topics if not already there
    const alreadyCompleted = user.completed_topics.some(t => t.topic === topic && t.subject === subject);
    if (!alreadyCompleted) {
        user.completed_topics.push({ topic, subject, completed_at: new Date() });
        await user.save();
    }

    // Trigger roadmap rebuild/regen schedule for tomorrow or today
    await scheduleService.generateDailySchedule(userId);

    // Recalculate ability score (topic completion affects Roadmap Progress component)
    await abilityService.updateAbilityScore(userId);

    res.status(200).json({
        status: 'success',
        message: `Topic ${topic} marked as complete and roadmap rebuilt.`,
        data: user.completed_topics
    });
});

module.exports = {
    generateSchedule,
    getTodaySchedule,
    completeTask,
    markTopicComplete
};
