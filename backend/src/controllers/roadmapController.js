const asyncHandler = require('../utils/asyncHandler');
const roadmapService = require('../services/roadmapService');

/**
 * @desc    Generate personalized roadmap based on test session results
 * @route   GET /api/v1/roadmap/generate
 * @access  Private
 */
const generateRoadmap = asyncHandler(async (req, res) => {
    const { testSessionId } = req.query;

    if (!testSessionId) {
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide testSessionId in query parameters'
        });
    }

    try {
        const roadmap = await roadmapService.generateRoadmap(testSessionId);

        res.status(200).json({
            status: 'success',
            message: 'Roadmap generated and stored successfully',
            data: roadmap
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to generate roadmap'
        });
    }
});

/**
 * @desc    Get the latest roadmap for the user
 * @route   GET /api/v1/roadmap/latest
 * @access  Private
 */
const getLatestRoadmap = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const Roadmap = require('../models/Roadmap');

    const roadmap = await Roadmap.findOne({ user_id: userId }).sort({ createdAt: -1 });

    if (!roadmap) {
        return res.status(404).json({
            status: 'fail',
            message: 'No roadmap found for this user'
        });
    }

    res.status(200).json({
        status: 'success',
        data: roadmap
    });
});

/**
 * @desc    Update task status (mark as completed or not)
 * @route   PATCH /api/v1/roadmap/tasks/:taskId
 * @access  Private
 */
const patchTaskStatus = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { completed } = req.body;
    const userId = req.user.id;

    if (completed === undefined) {
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide completed status in request body'
        });
    }

    const { roadmap, updatedTask } = await roadmapService.updateTaskStatus(userId, taskId, completed);

    res.status(200).json({
        status: 'success',
        data: {
            task: updatedTask
        }
    });
});

module.exports = {
    generateRoadmap,
    getLatestRoadmap,
    patchTaskStatus
};
