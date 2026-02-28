const { body } = require('express-validator');

const explainValidation = [
    body('question_id')
        .trim()
        .notEmpty()
        .withMessage('Question ID is required'),

    body('student_answer')
        .notEmpty()
        .withMessage('Student answer is required'),

    body('mastery_level')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Mastery level must be between 0 and 1'),

    body('exam')
        .optional()
        .trim()
];

const practiceValidation = [
    body('topic')
        .trim()
        .notEmpty()
        .withMessage('Topic is required'),

    body('difficulty')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Difficulty must be between 0 and 1'),

    body('count')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Count must be between 1 and 10'),

    body('mastery_level')
        .optional()
        .isFloat({ min: 0, max: 1 })
        .withMessage('Mastery level must be between 0 and 1')
];

module.exports = {
    explainValidation,
    practiceValidation
};
