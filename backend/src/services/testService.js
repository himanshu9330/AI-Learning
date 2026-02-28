const Test = require('../models/Test');
const Answer = require('../models/Answer');
const User = require('../models/User');
const TestSession = require('../models/TestSession');
const adaptiveAlgorithm = require('../utils/adaptiveAlgorithm');
const masteryCalculator = require('../utils/masteryCalculator');
const adaptiveEngine = require('../services/adaptiveEngine');
const AppError = require('../utils/AppError');
const JSONLoader = require('../utils/jsonLoader');
const fs = require('fs');
const path = require('path');
const abilityService = require('./abilityService');
const backgroundWorker = require('../utils/backgroundWorker');
const roadmapService = require('./roadmapService');

class TestService {
    /**
     * Start/Resume adaptive test session
     */
    async startTest(userId, subject, chapter = null, topic = null) {
        const user = await User.findById(userId);
        if (!user) throw new AppError('User not found', 404);

        // Standardized allowed subjects check
        const allowed = {
            'JEE': ['Mathematics', 'Physics', 'Chemistry'],
            'NEET': ['Biology', 'Physics', 'Chemistry'],
            'BITSAT': ['Mathematics', 'Physics', 'Chemistry']
        };
        const userTarget = (user.target_exam || 'JEE').toUpperCase();
        const allowedList = allowed[userTarget] || allowed['JEE'];

        // Case-insensitive subject check
        const isAllowed = allowedList.some(s => s.toLowerCase() === subject.toLowerCase());
        if (!isAllowed) {
            throw new AppError(`Subject ${subject} is not allowed for ${userTarget}`, 400);
        }

        // Check for existing active session WITH SAME filters
        let session = await TestSession.findOne({
            user_id: userId,
            subject,
            chapter,
            topic,
            status: 'active'
        });

        if (!session) {
            // DEACTIVATE any other active session to prevent race conditions/subject mixups
            await TestSession.updateMany(
                { user_id: userId, status: 'active' },
                { $set: { status: 'paused' } }
            );

            // Create new Test record for history
            const test = await Test.create({
                user_id: userId,
                subject: subject,
                chapter: chapter,
                topic: topic,
                ability_before: user.ability_score,
                status: 'active'
            });

            // Create new TestSession
            // Normalize exam name for filename
            const examNormalized = userTarget.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

            session = await TestSession.create({
                user_id: userId,
                test_id: test.test_id,
                subject,
                chapter,
                topic,
                exam: examNormalized
            });
        }

        const questionIdToLoad = session.currentQuestionId;
        let question;

        if (questionIdToLoad) {
            // Load the specific question the user was on
            const fileName = `${session.exam}_questions.json`;
            const filePath = path.join(__dirname, '../../data', fileName);
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                question = data.questions.find(q => q.question_id === questionIdToLoad);
            }
        }

        if (!question) {
            question = await adaptiveEngine.selectRandomQuestion(session);
            if (!question) throw new AppError('No questions available', 404);
            session.currentQuestionId = question.question_id;
        }

        await session.save();

        return {
            session,
            question: {
                ...question,
                id: question.question_id
            },
            ability_score: user.ability_score
        };
    }

    /**
     * Submit answer for active session
     */
    async submitAnswer(userId, questionId, selectedOption, req = { body: {} }, testId = null) {
        let session;
        if (testId) {
            session = await TestSession.findOne({ user_id: userId, test_id: testId });
        } else {
            session = await TestSession.findOne({ user_id: userId, status: 'active' });
        }

        if (!session) throw new AppError('No active session found', 404);

        const test = await Test.findOne({ test_id: session.test_id });
        const user = await User.findById(userId);

        const question = JSONLoader.getQuestionById(session.exam, questionId);

        if (!question) throw new AppError('Question not found', 404);

        const isCorrect = await adaptiveEngine.recordAnswer(session, question, selectedOption);

        // Map string difficulty to numeric value for DB schema
        const difficultyMap = { 'easy': 0.3, 'medium': 0.6, 'hard': 0.9 };
        const numericDifficulty = typeof question.difficulty === 'number'
            ? question.difficulty
            : (difficultyMap[question.difficulty.toLowerCase()] || 0.5);

        // Record Answer in DB for history
        await Answer.create({
            user_id: userId,
            question_id: questionId,
            test_id: session.test_id,
            selected_option: selectedOption,
            correct: isCorrect,
            response_time_ms: req.body.responseTime || 5000, // Default if missing
            difficulty: numericDifficulty,
            ability_at_time: user.ability_score,
            topic_tags: question.topic_tags || []
        });

        // Update Topic Mastery
        await masteryCalculator.updateTopicMastery(
            userId,
            session.subject,
            question.chapter,
            question.topic_tags || [],
            isCorrect,
            numericDifficulty
        );

        // Update User Ability Score via AbilityService (weighted, EMA smoothed)
        backgroundWorker.enqueue(async () => {
            await abilityService.updateAbilityScore(userId);
        }, 'updateAbilityScoreSubmission');

        // Update Test history record
        test.questions_attempted += 1;
        if (isCorrect) test.correct_answers += 1;
        test.questions.push({
            question_id: questionId,
            difficulty: 1, // Simplified
            answered: true,
            correct: isCorrect
        });

        // Check for promotion or termination
        const evalResult = await adaptiveEngine.evaluateBatch(session);

        if (evalResult.terminated) {
            // Also complete the Test history record
            await test.completeTest(user.ability_score);

            // Generate Roadmap for this session (Offload to background)
            backgroundWorker.enqueue(async () => {
                try {
                    await roadmapService.generateRoadmap(session.test_id);
                    console.log(`[DEBUG] Roadmap generated for session ${session.test_id}`);
                } catch (error) {
                    console.error('Failed to auto-generate roadmap:', error.message);
                }
            }, 'generateRoadmapTermination');
        }

        // Clear current question since it's now answered
        session.currentQuestionId = null;

        await session.save();
        await test.save();

        return {
            isCorrect,
            explanation: question.explanation,
            correctOption: question.correct_option,
            batchProgress: session.batchCount,
            currentLevel: session.currentLevel,
            evalResult
        };
    }

    /**
     * Complete test and calculate final results
     * @param {String} testId - Test ID
     * @returns {Object} Test results
     */
    async completeTest(testId) {
        const test = await Test.findOne({ test_id: testId });
        if (!test) {
            throw new AppError('Test not found', 404);
        }

        const user = await User.findById(test.user_id);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Complete the test
        await test.completeTest(user.ability_score);

        // Generate Roadmap for this session (Offload to background)
        const backgroundWorker = require('../utils/backgroundWorker');
        backgroundWorker.enqueue(async () => {
            try {
                const roadmapService = require('./roadmapService');
                await roadmapService.generateRoadmap(test.test_id);
                console.log(`[DEBUG] Roadmap generated for manual completion of test ${test.test_id}`);
            } catch (error) {
                console.error('Failed to generate roadmap after manual completion:', error.message);
            }
        }, 'generateRoadmapManualCompletion');

        // Get topic mastery summary
        const masterySummary = await masteryCalculator.getUserMasterySummary(user._id);

        return {
            test_completed: true,
            test_id: test.test_id,
            results: {
                questions_attempted: test.questions_attempted,
                correct_answers: test.correct_answers,
                final_score: test.final_score,
                accuracy: test.accuracy,
                duration_minutes: test.duration_minutes,
                ability_before: test.ability_before,
                ability_after: test.ability_after,
                ability_improvement: test.ability_after - test.ability_before
            },
            topic_mastery: masterySummary
        };
    }

    /**
     * Get test results
     * @param {String} testId - Test ID
     * @returns {Object} Test results
     */
    async getTestResult(testId) {
        const test = await Test.findOne({ test_id: testId }).populate('user_id', 'name email');
        if (!test) {
            throw new AppError('Test not found', 404);
        }

        // Get all answers for this test
        const answers = await Answer.find({ test_id: testId });

        return {
            test,
            answers,
            summary: {
                questions_attempted: test.questions_attempted,
                correct_answers: test.correct_answers,
                final_score: test.final_score,
                accuracy: test.accuracy,
                duration_minutes: test.duration_minutes,
                ability_change: test.ability_after - test.ability_before
            }
        };
    }

    /**
     * Get user's test history
     * @param {String} userId - User ID
     * @param {Number} limit - Number of tests to return
     * @returns {Array} Test history
     */
    async getUserTestHistory(userId, limit = 10) {
        const tests = await Test.find({ user_id: userId })
            .sort({ createdAt: -1 })
            .limit(limit);

        return tests.map(test => ({
            test_id: test.test_id,
            subject: test.subject,
            chapter: test.chapter,
            topic: test.topic,
            start_time: test.start_time || test.createdAt,
            final_score: test.final_score,
            accuracy: test.accuracy,
            questions_attempted: test.questions_attempted,
            correct_answers: test.correct_answers,
            ability_before: test.ability_before,
            ability_after: test.ability_after,
            status: test.status
        }));
    }

    /**
     * Get test status and current question
     * @param {String} testId - Test ID
     * @param {String} userId - User ID
     * @returns {Object} Test status
     */
    async getTestStatus(testId, userId) {
        const test = await Test.findOne({ test_id: testId, user_id: userId });
        if (!test) {
            throw new AppError('Test not found', 404);
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        return {
            test_id: test.test_id,
            subject: test.subject,
            status: test.status,
            current_ability_score: user.ability_score,
            current_metrics: {
                questions_attempted: test.questions_attempted
            }
        };
    }

    /**
     * Get next question for active session
     */
    async getNextQuestion(userId, testId = null) {
        let session;
        if (testId) {
            session = await TestSession.findOne({ user_id: userId, test_id: testId });
        } else {
            session = await TestSession.findOne({ user_id: userId, status: 'active' });
        }

        if (!session) throw new AppError('No active session found', 404);

        const question = await adaptiveEngine.selectRandomQuestion(session);
        if (!question) throw new AppError('No more questions available', 404);

        session.currentQuestionId = question.question_id;
        await session.save();
        return {
            ...question,
            id: question.question_id
        };
    }

    /**
     * Resume existing active session
     */
    async resumeSession(userId) {
        const session = await TestSession.findOne({ user_id: userId, status: 'active' })
            .sort({ last_accessed: -1 });

        if (!session) return { message: 'No active session found' };

        return {
            session,
            message: 'Session resumed'
        };
    }

    /**
     * Get specific session by test_id
     */
    async getSessionByTestId(userId, testId) {
        const session = await TestSession.findOne({ user_id: userId, test_id: testId });
        if (!session) {
            throw new AppError('Session not found', 404);
        }
        return session;
    }

    /**
     * Reset/Clear active session
     */
    async resetSession(userId) {
        const session = await TestSession.findOne({ user_id: userId, status: 'active' });
        if (session) {
            session.attemptedQuestionIds = [];
            session.currentLevel = 1;
            session.batchCount = 0;
            session.batchCorrect = 0;
            session.batchIncorrect = 0;
            session.totalScore = 0;
            session.currentQuestionId = null;
            await session.save();
        }
        return { message: 'Session reset successfully' };
    }
}

module.exports = new TestService();
