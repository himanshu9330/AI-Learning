/**
 * Adaptive Question Selection Algorithm
 * Selects questions based on user's ability score with dynamic range expansion
 */

const Question = require('../models/Question');

class AdaptiveAlgorithm {
    /**
     * Select next question for user based on ability score
     * @param {Number} userAbility - User's current ability score (0-1)
     * @param {String} subject - Subject filter
     * @param {Array} attemptedQuestionIds - Questions already attempted in this session
     * @returns {Object} Selected question
     */
    async selectQuestion(userAbility, subject, attemptedQuestionIds = []) {
        let range = 0.05; // Initial range: ±0.05
        const maxRange = 0.3; // Maximum range expansion
        const rangeIncrement = 0.05;

        while (range <= maxRange) {
            const minDifficulty = Math.max(0, userAbility - range);
            const maxDifficulty = Math.min(1, userAbility + range);

            const query = {
                difficulty: { $gte: minDifficulty, $lte: maxDifficulty },
                question_id: { $nin: attemptedQuestionIds }
            };

            if (subject) {
                query.subject = subject;
            }

            const questions = await Question.find(query);

            if (questions.length > 0) {
                // Randomly select from available questions
                const randomIndex = Math.floor(Math.random() * questions.length);
                return questions[randomIndex];
            }

            // Expand range if no questions found
            range += rangeIncrement;
        }

        // If still no questions found, throw error
        throw new Error('No suitable questions found. Question pool may be empty or all questions attempted.');
    }

    /**
     * Update user's ability score based on answer correctness
     * @param {Number} currentAbility - Current ability score
     * @param {Number} questionDifficulty - Difficulty of answered question (0-1)
     * @param {Boolean} isCorrect - Whether answer was correct
     * @returns {Number} Updated ability score
     */
    updateAbilityScore(currentAbility, questionDifficulty, isCorrect) {
        let newAbility;

        if (isCorrect) {
            // Correct answer: increase ability based on question difficulty
            // Harder questions give more boost
            newAbility = currentAbility + 0.05 * (1 - questionDifficulty);
        } else {
            // Incorrect answer: decrease ability based on question difficulty
            // Harder questions cause less penalty
            newAbility = currentAbility - 0.05 * questionDifficulty;
        }

        // Clamp ability score between 0 and 1
        return Math.max(0, Math.min(1, newAbility));
    }

    /**
     * Calculate recommended difficulty range for user
     * @param {Number} abilityScore - User's ability score
     * @returns {Object} Min and max difficulty
     */
    getRecommendedDifficultyRange(abilityScore) {
        return {
            min: Math.max(0, abilityScore - 0.1),
            max: Math.min(1, abilityScore + 0.1),
            optimal: abilityScore
        };
    }

    /**
     * Predict success probability for a question
     * @param {Number} abilityScore - User's ability score
     * @param {Number} questionDifficulty - Question difficulty
     * @returns {Number} Probability of success (0-1)
     */
    predictSuccessProbability(abilityScore, questionDifficulty) {
        // Simple logistic model
        const diff = abilityScore - questionDifficulty;
        return 1 / (1 + Math.exp(-5 * diff));
    }
}

module.exports = new AdaptiveAlgorithm();
