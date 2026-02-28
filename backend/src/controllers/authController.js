const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');
const logger = require('../utils/logger');

/**
 * @desc    Register user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);

    res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: result
    });
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    logger.info(`User login successful: ${email}`);

    res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: result
    });
});

/**
 * @desc    Get user profile
 * @route   GET /api/v1/auth/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.user.id);

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user.id, req.body);

    res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
            user
        }
    });
});

/**
 * @desc    Google OAuth Login
 * @route   POST /api/v1/auth/google
 * @access  Public
 */
const googleLogin = asyncHandler(async (req, res) => {
    console.log('Google Login Request Body:', req.body ? 'Has Body' : 'No Body');
    console.log('ID Token length:', req.body.idToken ? req.body.idToken.length : 'Missing');

    const result = await authService.googleLogin(req.body.idToken);

    res.status(200).json({
        status: 'success',
        message: 'Google login successful',

        data: result
    }); logger.info('hoooo  gyaaaaaaa');
});

module.exports = {
    register,
    login,
    googleLogin,
    getProfile,
    updateProfile
};
