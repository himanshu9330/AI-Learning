const aiService = require('../services/aiService');
const Timetable = require('../models/Timetable');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Generate a smart timetable using AI
 * @route   POST /api/v1/timetable/generate
 * @access  Private
 */
exports.generateTimetable = asyncHandler(async (req, res, next) => {
    const { subjects, wakeTime, sleepTime, mealTimes, profile, coachingTime, extras } = req.body;

    // Validate required fields
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
        return next(new AppError('Please provide at least one subject to study', 400));
    }

    if (!wakeTime || !sleepTime) {
        return next(new AppError('Wake time and sleep time are required', 400));
    }

    // Call AI Service to generate the timetable
    try {
        const timetableResponse = await aiService.generateTimetable({
            subjects,
            wakeTime,
            sleepTime,
            mealTimes: mealTimes || '',
            profile: profile || 'Student',
            coachingTime: coachingTime || '',
            extras: extras || ''
        });

        scheduleData = timetableResponse.weekly_schedule;
    } catch (error) {
        console.error('AI Timetable generation failed, using fallback:', error.message);
        // Robust fallback: generate a simple schedule
        scheduleData = generateFallbackSchedule(subjects, wakeTime, sleepTime);
    }

    // Save or update in database
    let userTimetable = await Timetable.findOne({ user_id: req.user.id });

    if (userTimetable) {
        userTimetable.weeklySchedule = scheduleData;
        await userTimetable.save();
    } else {
        userTimetable = await Timetable.create({
            user_id: req.user.id,
            weeklySchedule: scheduleData
        });
    }

    res.status(200).json({
        success: true,
        data: userTimetable.weeklySchedule
    });
});

/**
 * Fallback schedule generator when AI fails
 */
function generateFallbackSchedule(subjects, wakeTime, sleepTime) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const schedule = {};

    days.forEach(day => {
        const daySchedule = [];
        // Simple 3-slot structure
        subjects.forEach((subject, idx) => {
            const startHour = 9 + (idx * 3);
            if (startHour < 21) {
                daySchedule.push({
                    start: `${startHour}:00 AM`,
                    end: `${startHour + 2}:00 AM`,
                    task: `Study ${subject}`,
                    type: "study",
                    subject: subject
                });
            }
        });
        schedule[day] = daySchedule;
    });

    return schedule;
}

/**
 * @desc    Get user's saved timetable
 * @route   GET /api/v1/timetable
 * @access  Private
 */
exports.getTimetable = asyncHandler(async (req, res, next) => {
    const timetable = await Timetable.findOne({ user_id: req.user.id });

    if (!timetable) {
        return res.status(200).json({
            success: true,
            data: [],
            message: "No timetable found for this user."
        });
    }

    res.status(200).json({
        success: true,
        data: timetable.weeklySchedule
    });
});
