const asyncHandler = require('../utils/asyncHandler');
const roadmapService = require('../services/roadmapService');
const TopicMastery = require('../models/TopicMastery');
const Answer = require('../models/Answer');
const fs = require('fs');
const path = require('path');

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

/**
 * @desc    Get chapter-level progress for user (all subjects)
 * @route   GET /api/v1/roadmap/chapters
 * @access  Private
 */
const getChapterProgress = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const User = require('../models/User');
    const user = await User.findById(userId);
    const exam = (user?.target_exam || 'JEE').toLowerCase();

    // Load chapters from JSON data
    let fileName = `${exam}_questions.json`;
    let filePath = path.join(__dirname, '../../data', fileName);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, '../../data/jee_questions.json');
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const chapterMap = {};
    data.questions.forEach(q => {
        const key = `${q.subject}::${q.chapter}`;
        if (!chapterMap[key]) {
            chapterMap[key] = { subject: q.subject, chapter: q.chapter, prerequisites: [] };
        }
    });

    // Get mastery data for this user
    const masteryData = await TopicMastery.find({ user_id: userId });
    const masteryByChapter = {};
    masteryData.forEach(m => {
        if (!masteryByChapter[m.topic]) masteryByChapter[m.topic] = [];
        masteryByChapter[m.topic].push(m.mastery_percentage || 0);
    });

    // Get chapters with test attempts
    const answers = await Answer.find({ user_id: userId });
    const attemptedChapters = new Set();
    answers.forEach(a => { if (a.chapter) attemptedChapters.add(a.chapter); });

    const PREREQUISITE_MAP = {
        'Mechanics': [],
        'Kinematics': ['Mechanics'],
        'Gravitation': ['Mechanics', 'Kinematics'],
        'Waves': ['Mechanics'],
        'Thermodynamics': ['Heat'],
        'Electricity': ['Mechanics'],
        'Light': ['Waves'],
        'Modern Physics': ['Light', 'Electricity'],
        'Nuclei': ['Modern Physics'],
        'Heat': ['Mechanics'],
        'Units': []
    };

    const chapters = Object.values(chapterMap).map(c => {
        const masteryArr = masteryByChapter[c.chapter] || [];
        const avgMastery = masteryArr.length > 0
            ? Math.round(masteryArr.reduce((a, b) => a + b, 0) / masteryArr.length)
            : 0;
        const attempted = attemptedChapters.has(c.chapter);
        let status = 'not_started';
        if (attempted && avgMastery >= 75) status = 'mastered';
        else if (attempted && avgMastery >= 40) status = 'in_progress';
        else if (attempted) status = 'weak';

        return {
            subject: c.subject,
            chapter: c.chapter,
            status,
            mastery: avgMastery,
            prerequisites: PREREQUISITE_MAP[c.chapter] || []
        };
    });

    res.status(200).json({ status: 'success', data: { chapters } });
});

/**
 * @desc    Get chapters due for revision today (spaced repetition)
 * @route   GET /api/v1/roadmap/revisions
 * @access  Private
 */
const getRevisions = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const Roadmap = require('../models/Roadmap');
    const roadmap = await Roadmap.findOne({ user_id: userId }).sort({ createdAt: -1 });

    if (!roadmap || !roadmap.revision_schedule || roadmap.revision_schedule.length === 0) {
        return res.status(200).json({ status: 'success', data: { revisions: [] } });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = roadmap.revision_schedule.filter(r => {
        const revDate = new Date(r.next_revision_date);
        revDate.setHours(0, 0, 0, 0);
        return revDate <= today;
    });

    res.status(200).json({ status: 'success', data: { revisions: due } });
});

module.exports = {
    generateRoadmap,
    getLatestRoadmap,
    patchTaskStatus,
    getChapterProgress,
    getRevisions
};
