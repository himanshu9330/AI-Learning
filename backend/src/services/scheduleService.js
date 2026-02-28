const DailySchedule = require('../models/DailySchedule');
const TopicMastery = require('../models/TopicMastery');
const Roadmap = require('../models/Roadmap');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

class ScheduleService {
    /**
     * Generate a daily schedule for a user
     * @param {string} userId 
     * @param {Date} date 
     */
    async generateDailySchedule(userId, date = new Date()) {
        date.setHours(0, 0, 0, 0);

        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        // 1. Get user's weak topics from mastery
        const weakTopics = await TopicMastery.getWeakTopics(userId, 5);

        // 2. Get latest roadmap
        const roadmap = await Roadmap.findOne({ user_id: userId }).sort({ createdAt: -1 });

        // 3. Define subjects and time allocation (e.g., 2 hours each for 3 subjects)
        const subjects = this._getSubjectsForExam(user.target_exam || 'JEE');
        const sessionDuration = 90; // 1.5 hours per subject session
        const breakDuration = 15;   // 15 mins break

        let tasks = [];
        let currentMinutes = 0;
        const totalMinutes = 360; // 6 hours

        // Topic queue: prioritize weak topics first, then roadmap topics (FILTER OUT COMPLETED)
        const completedTopicNames = user.completed_topics.map(ct => ct.topic);

        let topicQueue = [...weakTopics]
            .filter(t => !completedTopicNames.includes(t.topic))
            .map(t => ({ topic: t.topic, subject: t.subject, importance: 3 }));

        if (roadmap && roadmap.weak_topics) {
            roadmap.weak_topics.forEach(t => {
                if (!topicQueue.find(q => q.topic === t) && !completedTopicNames.includes(t)) {
                    topicQueue.push({ topic: t, subject: roadmap.subject, importance: 2 });
                }
            });
        }

        // Fill 6 hours
        let topicIndex = 0;
        while (currentMinutes < totalMinutes && topicIndex < topicQueue.length * 2) {
            const topicData = topicQueue[topicIndex % topicQueue.length];

            // Add a session
            tasks.push({
                task_id: uuidv4(),
                type: "practice", // Alternating between practice and revision
                subject: topicData.subject,
                topic: topicData.topic,
                duration_minutes: sessionDuration,
                status: "pending",
                difficulty: "medium",
                importance: topicData.importance
            });
            currentMinutes += sessionDuration;

            // Add a break if not at the end
            if (currentMinutes < totalMinutes) {
                tasks.push({
                    task_id: uuidv4(),
                    type: "break",
                    duration_minutes: breakDuration,
                    status: "completed" // Breaks are auto-completed
                });
                currentMinutes += breakDuration;
            }

            topicIndex++;
        }

        // Adjust last task if it exceeds totalMinutes
        if (currentMinutes > totalMinutes) {
            const excess = currentMinutes - totalMinutes;
            const lastTask = tasks[tasks.length - 1];
            if (lastTask.type === 'break') {
                tasks.pop();
            } else {
                lastTask.duration_minutes -= excess;
            }
        }

        // Save or update schedule
        let schedule = await DailySchedule.findOne({ user_id: userId, date });
        if (schedule) {
            schedule.tasks = tasks;
            schedule.is_regenerated = true;
            await schedule.save();
        } else {
            schedule = await DailySchedule.create({
                user_id: userId,
                date,
                tasks,
                total_duration_minutes: totalMinutes
            });
        }

        return schedule;
    }

    /**
     * Get subjects based on exam
     */
    _getSubjectsForExam(exam) {
        const map = {
            'JEE': ['Mathematics', 'Physics', 'Chemistry'],
            'NEET': ['Biology', 'Physics', 'Chemistry'],
            'BITSAT': ['Mathematics', 'Physics', 'Chemistry', 'English']
        };
        return map[exam.toUpperCase()] || map['JEE'];
    }

    /**
     * Mark a task as complete and update ability score
     */
    async completeTask(userId, taskId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const schedule = await DailySchedule.findOne({ user_id: userId, date: today });
        if (!schedule) throw new Error('No schedule found for today');

        const task = schedule.tasks.find(t => t.task_id === taskId);
        if (!task) throw new Error('Task not found');

        task.status = 'completed';
        task.completed_at = new Date();

        await schedule.save();

        // Calculate current completion percentage for consistency update
        const completionRate = schedule.completion_percentage / 100;

        // Update consistency in AbilityService
        const abilityService = require('./abilityService');
        await abilityService.updateConsistency(userId, completionRate);

        return schedule;
    }

    /**
     * Get today's schedule
     */
    async getTodaySchedule(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return await DailySchedule.findOne({ user_id: userId, date: today });
    }
}

module.exports = new ScheduleService();
