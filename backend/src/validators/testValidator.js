const { body } = require('express-validator');

const startTestValidation = [
    body('subject')
        .trim()
        .notEmpty()
        .withMessage('Subject is required')
];

const submitAnswerValidation = [
    body('test_id')
        .trim()
        .notEmpty()
        .withMessage('Test ID is required'),

    body('question_id')
        .trim()
        .notEmpty()
        .withMessage('Question ID is required'),

    body('selected_option')
        .notEmpty()
        .withMessage('Selected option is required'),

    body('response_time_ms')
        .isInt({ min: 0 })
        .withMessage('Response time must be a positive integer')
];

module.exports = {
    startTestValidation,
    submitAnswerValidation
};
