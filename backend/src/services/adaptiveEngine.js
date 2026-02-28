const JSONLoader = require('../utils/jsonLoader');

/**
 * Adaptive Engine Service
 * Manages the adaptive testing logic, level promotion, and question selection.
 */
class AdaptiveEngine {
    /**
     * Map numerical level to difficulty string
     * @param {Number} level - 1, 2, or 3
     * @returns {String} 'easy', 'medium', or 'hard'
     */
    static getDifficultyFromLevel(level) {
        const levels = {
            1: 'easy',
            2: 'medium',
            3: 'hard'
        };
        return levels[level] || 'easy';
    }

    /**
     * Select a random question for the session
     * @param {Object} session - TestSession database object
     * @returns {Object|null}
     */
    static async selectRandomQuestion(session) {
        const difficulty = this.getDifficultyFromLevel(session.currentLevel);

        console.log(`[DEBUG] AdaptiveEngine selecting question:`, {
            exam: session.exam,
            subject: session.subject,
            chapter: session.chapter,
            topic: session.topic,
            difficulty: difficulty,
            attemptedCount: session.attemptedQuestionIds?.length || 0
        });

        const question = JSONLoader.getQuestion({
            exam: session.exam,
            subject: session.subject,
            chapter: session.chapter,
            topic: session.topic,
            difficulty: difficulty,
            excludeIds: session.attemptedQuestionIds
        });

        console.log(`[DEBUG] JSONLoader returned:`, question ? question.question_id : 'NULL');

        return question;
    }

    /**
     * Record a user's answer and update session stats
     */
    static async recordAnswer(session, question, selectedOption) {
        const isCorrect = question.correct_option === selectedOption;

        // Define marks based on levels
        const levelMarks = { 1: 1, 2: 2, 3: 4 };
        const marks = levelMarks[session.currentLevel] || 1;

        // Update session tracking
        session.attemptedQuestionIds.push(question.question_id);
        session.batchCount += 1;

        if (isCorrect) {
            session.batchCorrect += 1;
            session.totalScore += marks;
        } else {
            session.batchIncorrect += 1;
        }

        return isCorrect;
    }

    /**
     * Evaluate the current batch performance and determine next steps
     * Rules: 
     * - incorrect >= 3 -> terminate
     * - batchCount = 5 AND correct >= 4 -> promote
     */
    static async evaluateBatch(session) {
        // 1. Termination check
        if (session.batchIncorrect >= 3) {
            session.status = 'completed';
            return {
                terminated: true,
                reason: 'Too many incorrect answers',
                nextAction: 'terminate'
            };
        }

        // 2. Promotion check (only at end of batch)
        if (session.batchCount < session.batchTotal) {
            return { promoted: false, nextAction: 'continue' };
        }

        let promoted = false;
        if (session.batchCorrect >= 4 && session.currentLevel < 3) {
            session.currentLevel = this.promoteLevel(session.currentLevel);
            promoted = true;
        }

        // Reset batch counters for next block
        session.batchCount = 0;
        session.batchCorrect = 0;
        session.batchIncorrect = 0;

        return {
            promoted,
            nextLevel: session.currentLevel,
            nextAction: promoted ? 'level_up' : 'stay_level'
        };
    }

    /**
     * Promote level to the next tier
     * @param {Number} level - Current level
     * @returns {Number} Next level
     */
    static promoteLevel(level) {
        if (level < 3) return level + 1;
        return level;
    }
}

module.exports = AdaptiveEngine;
