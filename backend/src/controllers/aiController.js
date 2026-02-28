const asyncHandler = require('../utils/asyncHandler');
const aiService = require('../services/aiService');
const Question = require('../models/Question');
const AppError = require('../utils/AppError');
const JSONLoader = require('../utils/jsonLoader');

/**
 * @desc    Get AI explanation for a question
 * @route   POST /api/v1/ai/explain
 * @access  Private
 */
const getExplanation = asyncHandler(async (req, res) => {
    const { question_id, student_answer, mastery_level, exam } = req.body;

    let question;

    // 1. Try to get from MongoDB first
    question = await Question.findOne({ question_id });

    // 2. Fallback to JSONLoader if not in DB (common for JEE/NEET questions)
    if (!question && exam) {
        const jsonQuestion = JSONLoader.getQuestionById(exam, question_id);
        if (jsonQuestion) {
            question = {
                text: jsonQuestion.text,
                correct_option: jsonQuestion.correct_option,
                topic_tags: jsonQuestion.topic_tags || [],
                difficulty: jsonQuestion.difficulty
            };
        }
    }

    if (!question) {
        throw new AppError('Question not found', 404);
    }

    // Prepare data for AI service
    const aiData = {
        question_text: question.text,
        correct_answer: question.correct_option,
        student_answer: student_answer,
        topic: question.topic_tags[0] || 'General',
        mastery_level: mastery_level || 0.5,
        difficulty: typeof question.difficulty === 'number' ? question.difficulty : 0.5
    };

    // Get AI explanation
    const explanation = await aiService.generateExplanation(aiData);

    res.status(200).json({
        status: 'success',
        data: {
            question: {
                text: question.text,
                correct_answer: question.correct_option,
                student_answer: student_answer
            },
            ...explanation
        }
    });
});

/**
 * @desc    Generate practice questions
 * @route   POST /api/v1/ai/practice
 * @access  Private
 */
const generatePractice = asyncHandler(async (req, res) => {
    const { topic, difficulty, count, mastery_level } = req.body;

    const practiceData = {
        topic,
        difficulty: difficulty || 0.5,
        count: count || 5,
        mastery_level: mastery_level || 0.5
    };

    const practice = await aiService.generatePracticeQuestions(practiceData);

    res.status(200).json({
        status: 'success',
        data: practice
    });
});

/**
 * @desc    Check AI service health
 * @route   GET /api/v1/ai/health
 * @access  Private
 */
const checkHealth = asyncHandler(async (req, res) => {
    const isAvailable = await aiService.isAvailable();

    res.status(200).json({
        status: 'success',
        data: {
            ai_service_available: isAvailable,
            message: isAvailable
                ? 'AI service is operational'
                : 'AI service is unavailable - using fallback responses'
        }
    });
});

module.exports = {
    getExplanation,
    generatePractice,
    checkHealth
};
