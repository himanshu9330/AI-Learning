const asyncHandler = require('../utils/asyncHandler');
const aiService = require('../services/aiService');
const AppError = require('../utils/AppError');

/**
 * @desc    Summarize a YouTube video
 * @route   POST /api/v1/video/summarize
 * @access  Public
 */
const summarizeVideo = asyncHandler(async (req, res, next) => {
    const { youtube_url } = req.body;

    if (!youtube_url) {
        return next(new AppError('Please provide a YouTube URL', 400));
    }

    const summary = await aiService.summarizeVideo(youtube_url);

    res.status(200).json({
        status: 'success',
        data: summary
    });
});

module.exports = {
    summarizeVideo
};
