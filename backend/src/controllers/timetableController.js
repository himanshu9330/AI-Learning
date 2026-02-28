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

        const scheduleData = timetableResponse.schedule;

        // Save or update in database
        let userTimetable = await Timetable.findOne({ user_id: req.user.id });

        if (userTimetable) {
            userTimetable.schedule = scheduleData;
            await userTimetable.save();
        } else {
            userTimetable = await Timetable.create({
                user_id: req.user.id,
                schedule: scheduleData
            });
        }

        res.status(200).json({
            success: true,
            data: userTimetable.schedule
        });
    } catch (error) {
        console.error('Error generating timetable:', error);
        return next(new AppError('Failed to generate timetable using AI service', 500));
    }
});

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
        data: timetable.schedule
    });
});
