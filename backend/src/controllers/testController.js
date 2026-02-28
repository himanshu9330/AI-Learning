const asyncHandler = require('../utils/asyncHandler');
const testService = require('../services/testService');

/**
 * @desc    Start new adaptive test
 * @route   POST /api/test/start
 */
const startTest = asyncHandler(async (req, res) => {
    const { subject, chapter, topic } = req.body;
    const userId = req.user.id;

    const result = await testService.startTest(userId, subject, chapter, topic);

    res.status(201).json({
        status: 'success',
        message: 'Test started successfully',
        data: result
    });
});

/**
 * @desc    Get test metadata (subjects, chapters, topics)
 * @route   GET /api/test/metadata
 */
const getMetadata = asyncHandler(async (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const dataDir = path.join(__dirname, '../../data');
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('_questions.json'));

    const metadata = {};

    files.forEach(file => {
        const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
        const exam = content.exam.toUpperCase();

        if (!metadata[exam]) metadata[exam] = {};

        content.questions.forEach(q => {
            if (!metadata[exam][q.subject]) {
                metadata[exam][q.subject] = {
                    chapters: new Set(),
                    topics: new Set()
                };
            }
            if (q.chapter) metadata[exam][q.subject].chapters.add(q.chapter.trim());
            if (q.topic_tags) {
                q.topic_tags.forEach(tag => metadata[exam][q.subject].topics.add(tag));
            }
        });
    });

    // Convert sets to arrays for JSON response
    const finalMetadata = {};
    Object.keys(metadata).forEach(exam => {
        finalMetadata[exam] = {};
        Object.keys(metadata[exam]).forEach(sub => {
            finalMetadata[exam][sub] = {
                chapters: Array.from(metadata[exam][sub].chapters).sort(),
                topics: Array.from(metadata[exam][sub].topics).sort()
            };
        });
    });

    res.status(200).json({
        status: 'success',
        data: finalMetadata
    });
});

/**
 * @desc    Submit answer for active session
 * @route   POST /api/test/answer
 */
const submitAnswer = asyncHandler(async (req, res) => {
    const { questionId, selectedOption, testId } = req.body;
    const userId = req.user.id;

    const result = await testService.submitAnswer(userId, questionId, selectedOption, req, testId);

    res.status(200).json({
        status: 'success',
        data: result
    });
});

/**
 * @desc    Resume active session
 * @route   GET /api/test/resume
 */
const resumeSession = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await testService.resumeSession(userId);

    res.status(200).json({
        status: 'success',
        data: result
    });
});

/**
 * @desc    Get session by test_id
 * @route   GET /api/test/session/:testId
 */
const getSession = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const userId = req.user.id;
    const result = await testService.getSessionByTestId(userId, testId);

    res.status(200).json({
        status: 'success',
        data: result
    });
});

/**
 * @desc    Reset active session
 * @route   POST /api/test/reset
 */
const resetSession = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await testService.resetSession(userId);

    res.status(200).json({
        status: 'success',
        data: result
    });
});

/**
 * @desc    Get next question
 * @route   GET /api/test/next
 */
const getNextQuestion = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { testId } = req.params;

    const result = await testService.getNextQuestion(userId, testId);

    res.status(200).json({
        status: 'success',
        data: result
    });
});

/**
 * @desc    Get user test history
 * @route   GET /api/test/history
 */
const getHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const result = await testService.getUserTestHistory(userId, limit);

    res.status(200).json({
        status: 'success',
        data: {
            tests: result,
            count: result.length
        }
    });
});

module.exports = {
    startTest,
    submitAnswer,
    resumeSession,
    getSession,
    resetSession,
    getNextQuestion,
    getHistory,
    getMetadata
};
