const ProjectRoadmap = require('../models/Roadmap');
const TopicMastery = require('../models/TopicMastery');
const Test = require('../models/Test');
const aiService = require('./aiService');

/**
 * Roadmap Service
 * Logic for generating personalized study plans based on adaptive test results.
 */
class RoadmapService {
    /**
     * Generate a 7-day roadmap for a completed test session
     * @param {String} testSessionId - The test_id of the session
     * @returns {Promise<Object>} The generated roadmap document
     */
    async generateRoadmap(testSessionId) {
        // 1. Load TestSession
        const session = await require('../models/TestSession').findOne({ test_id: testSessionId });
        if (!session) {
            throw new Error('Test session not found');
        }

        // 2. Load all AnswerRecords for this session
        const allAnswers = await require('../models/Answer').find({ test_id: testSessionId });

        // 3. Determine terminationLevel
        const terminationLevel = session.currentLevel;

        // 4. Calculate performance ratios (accuracy per difficulty level)
        const performance = this._calculatePerformanceRatios(allAnswers);

        // 5. Aggregate performance by topic for AI prioritization
        const topicPerformance = this._getTopicPerformance(allAnswers);

        // 5a. Identify actually "weak" topics (accuracy < 80%)
        const weakTopicsList = topicPerformance.filter(t => {
            const accValues = [t.easy_accuracy, t.medium_accuracy, t.hard_accuracy].filter(a => a !== null);
            if (accValues.length === 0) return true;
            const avgAcc = accValues.reduce((a, b) => a + b, 0) / accValues.length;
            return avgAcc < 0.8;
        }).map(t => t.topic);

        // 6. Use AI to generate the full 7-day roadmap
        const aiResponse = await aiService.generateRoadmap({
            topics: topicPerformance,
            subject: session.subject
        });

        // Store roadmap in DB
        const roadmap = await ProjectRoadmap.create({
            user_id: session.user_id,
            test_session_id: testSessionId,
            subject: session.subject,
            terminationLevel: terminationLevel,
            weak_topics: weakTopicsList.length > 0 ? weakTopicsList : topicPerformance.map(t => t.topic),
            week_plan: aiResponse.week_plan,
            summary: aiResponse.summary
        });

        return roadmap;
    }

    /**
     * Update task completion status
     */
    async updateTaskStatus(userId, taskId, completed) {
        const roadmap = await ProjectRoadmap.findOne({
            user_id: userId,
            "week_plan.tasks._id": taskId
        });

        if (!roadmap) {
            throw new Error('Task or Roadmap not found');
        }

        // Find and update the task
        let updatedTask = null;
        for (const day of roadmap.week_plan) {
            const task = day.tasks.id(taskId);
            if (task) {
                task.completed = completed;
                updatedTask = task;
                break;
            }
        }

        await roadmap.save();
        return { roadmap, updatedTask };
    }

    /**
     * Helper to generate summary data for UI
     */
    async _generateSummary(userId, rankedTopics, prioritizedTopics, subject) {
        const masteryData = await TopicMastery.find({ user_id: userId, topic: { $in: rankedTopics } });

        const weak_topics = rankedTopics.map(topic => {
            const mastery = masteryData.find(m => m.topic === topic);
            const priorityInfo = prioritizedTopics.find(p => p.topic === topic);
            return {
                topic,
                mastery: mastery ? mastery.mastery_percentage : 0,
                priority: priorityInfo ? (priorityInfo.priority_score > 0.7 ? 'High' : 'Medium') : 'Medium'
            };
        });

        return {
            total_topics: rankedTopics.length,
            weak_topics,
            total_practice_questions: rankedTopics.length * 10, // Estimate
            total_study_hours: Math.ceil((rankedTopics.length * 45) / 60) || 3, // Estimate 45m per topic
            goal: `Master ${subject} fundamentals and core topics.`
        };
    }

    /**
     * Calculate accuracy ratios for each difficulty level (1, 2, 3)
     */
    _calculatePerformanceRatios(answers) {
        const stats = {
            1: { correct: 0, total: 0 },
            2: { correct: 0, total: 0 },
            3: { correct: 0, total: 0 }
        };

        answers.forEach(ans => {
            const level = ans.difficulty; // Assuming difficulty is stored as 1, 2, 3 or mapped
            // Map 0-1 range to 1-3 if needed. In our Answer model difficulty is 0-1 float.
            // However, in AdaptiveEngine it's levels 1, 2, 3. 
            // Let's assume the level mapping: 1 (easy), 2 (medium), 3 (hard) based on AdaptiveEngine.getDifficultyFromLevel
            // If the difficulty in Answer is 0-1, we map it back.
            let mappedLevel = 1;
            if (ans.difficulty > 0.3) mappedLevel = 2;
            if (ans.difficulty > 0.6) mappedLevel = 3;

            if (stats[mappedLevel]) {
                stats[mappedLevel].total++;
                if (ans.correct) stats[mappedLevel].correct++;
            }
        });

        return {
            easy: stats[1].total > 0 ? stats[1].correct / stats[1].total : null,
            medium: stats[2].total > 0 ? stats[2].correct / stats[2].total : null,
            hard: stats[3].total > 0 ? stats[3].correct / stats[3].total : null
        };
    }

    /**
     * Rank weak topics based on incorrect answer frequency
     */
    _rankWeakTopics(answers) {
        const topicCounts = {};
        answers.filter(ans => !ans.correct).forEach(ans => {
            if (ans.topic_tags && Array.isArray(ans.topic_tags)) {
                ans.topic_tags.forEach(topic => {
                    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
                });
            }
        });
        return Object.keys(topicCounts).sort((a, b) => topicCounts[b] - topicCounts[a]);
    }

    /**
     * Determine dynamic difficulty weights based on performance ratios
     */
    _getDynamicWeights(terminationLevel, performance) {
        // Default weights based on termination level (fallback)
        let weights = { easy: 40, medium: 40, hard: 20 };

        if (terminationLevel === 1) {
            weights = { easy: 70, medium: 20, hard: 10 };
        } else if (terminationLevel === 2) {
            weights = { easy: 40, medium: 40, hard: 20 };
        } else if (terminationLevel === 3) {
            weights = { easy: 20, medium: 30, hard: 50 };
        }

        // Apply advanced overrides based on performance ratios

        // 1. Critical Foundation Check: If EASY accuracy < 60%
        if (performance.easy !== null && performance.easy < 0.6) {
            // Force focus on Easy to build foundation, regardless of termination level
            return { easy: 80, medium: 15, hard: 5 };
        }

        // 2. The "Stuck in Middle" Check: Mastered Easy but failing Medium
        if (performance.easy !== null && performance.easy >= 0.8 &&
            performance.medium !== null && performance.medium < 0.5) {
            return { easy: 20, medium: 60, hard: 20 };
        }

        // 3. The "Advancing" Check: Good Easy/Medium performance, but failing Hard
        if (performance.medium !== null && performance.medium >= 0.7 &&
            performance.hard !== null && performance.hard < 0.4) {
            return { easy: 10, medium: 30, hard: 60 };
        }

        return weights;
    }

    /**
     * Generate structured 7-day plan
     */
    _generateWeekPlan(weakTopics, weights, subject) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const plan = [];

        const displayTopics = weakTopics.length > 0 ? weakTopics : [subject];

        days.forEach((day, index) => {
            const topic = displayTopics[index % displayTopics.length];
            const tasks = [];
            const primaryDifficulty = this._pickDifficulty(weights);

            tasks.push({
                type: index % 3 === 0 ? "concept_revision" : "practice",
                topic: topic,
                difficulty: primaryDifficulty,
                question_count: primaryDifficulty === 'hard' ? 5 : 10,
                duration: "30-45 mins"
            });

            if (day === 'Sunday') {
                tasks.push({
                    type: "mini_test",
                    topic: `${subject} Cumulative Review`,
                    difficulty: "medium",
                    question_count: 15,
                    duration: "60 mins"
                });
            } else {
                tasks.push({
                    type: "practice",
                    topic: topic,
                    difficulty: primaryDifficulty === 'easy' ? 'medium' : 'easy',
                    question_count: 8,
                    duration: "25 mins"
                });
            }

            plan.push({ day, tasks });
        });

        return plan;
    }

    /**
     * Aggregate performance data for each topic
     */
    _getTopicPerformance(answers) {
        const topicStats = {};

        answers.forEach(ans => {
            if (ans.topic_tags && Array.isArray(ans.topic_tags)) {
                ans.topic_tags.forEach(topic => {
                    if (!topicStats[topic]) {
                        topicStats[topic] = {
                            topic,
                            easy: { correct: 0, total: 0 },
                            medium: { correct: 0, total: 0 },
                            hard: { correct: 0, total: 0 }
                        };
                    }

                    let mappedLevel = 'easy';
                    if (ans.difficulty > 0.3) mappedLevel = 'medium';
                    if (ans.difficulty > 0.6) mappedLevel = 'hard';

                    topicStats[topic][mappedLevel].total++;
                    if (ans.correct) topicStats[topic][mappedLevel].correct++;
                });
            }
        });

        return Object.values(topicStats).map(t => ({
            topic: t.topic,
            easy_accuracy: t.easy.total > 0 ? t.easy.correct / t.easy.total : null,
            medium_accuracy: t.medium.total > 0 ? t.medium.correct / t.medium.total : null,
            hard_accuracy: t.hard.total > 0 ? t.hard.correct / t.hard.total : null
        }));
    }

    _pickDifficulty(weights) {
        const rand = Math.random() * 100;
        if (rand < weights.easy) return 'easy';
        if (rand < weights.easy + weights.medium) return 'medium';
        return 'hard';
    }
}

module.exports = new RoadmapService();
