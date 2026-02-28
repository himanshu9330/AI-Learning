const User = require('../models/User');
const AppError = require('../utils/AppError');
const { generateToken, generateRefreshToken } = require('../utils/jwtUtils');

class AuthService {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Object} User and token
     */
    async register(userData) {
        const { name, email, password, grade, target_exam } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('User already exists with this email', 400);
        }

        // Create user with default ability score of 0.5
        const user = await User.create({
            name,
            email,
            password,
            grade,
            target_exam,
            ability_score: 0.5 // Starting ability score
        });

        // Generate tokens
        const token = generateToken({ id: user._id, role: user.role });
        const refreshToken = generateRefreshToken({ id: user._id });

        return {
            user,
            token,
            refreshToken
        };
    }

    /**
     * Login user
     * @param {String} email - User email
     * @param {String} password - User password
     * @returns {Object} User and token
     */
    async login(email, password) {
        // Check if user exists
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        // Check if user is active
        if (!user.isActive) {
            throw new AppError('Account is deactivated', 403);
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
        }

        // Generate tokens
        const token = generateToken({ id: user._id, role: user.role });
        const refreshToken = generateRefreshToken({ id: user._id });

        return {
            user,
            token,
            refreshToken
        };
    }

    /**
     * Get user profile
     * @param {String} userId - User ID
     * @returns {Object} User profile
     */
    async getProfile(userId) {
        const user = await User.findById(userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    }

    /**
     * Update user profile
     * @param {String} userId - User ID
     * @param {Object} updateData - Data to update
     * @returns {Object} Updated user
     */
    async updateProfile(userId, updateData) {
        // Don't allow password, role, or ability_score update through this method
        delete updateData.password;
        delete updateData.role;
        delete updateData.ability_score; // Ability score updated only through tests

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    }

    /**
     * Google Login/Register
     * @param {String} idToken - Google ID Token
     * @returns {Object} User and Token
     */
    async googleLogin(idToken) {
        console.log('AuthService: Starting Google Login');
        console.log('GOOGLE_CLIENT_ID present:', !!process.env.GOOGLE_CLIENT_ID);

        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        try {
            console.log('AuthService: Verifying ID Token...');
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            console.log('AuthService: Token Verified');
            const payload = ticket.getPayload();
            const { sub: googleId, email, name, picture } = payload;
            console.log('AuthService: Payload extracted', { email, name });

            // Check if user exists
            let user = await User.findOne({ email });

            if (!user) {
                console.log('AuthService: User not found for Google login');
                throw new AppError('Account not found. Please sign up first.', 404);
            }

            console.log('AuthService: User found');
            // If user exists but no googleId (legacy email/password user), link it
            if (!user.googleId) {
                console.log('AuthService: Linking legacy user');
                user.googleId = googleId;
                user.avatar = picture || user.avatar;
                await user.save();
            }

            // Generate JWT
            const token = generateToken({ id: user._id, role: user.role });
            console.log('AuthService: Token generated');

            return {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    grade: user.grade,
                    target_exam: user.target_exam,
                    role: user.role,
                    avatar: user.avatar
                },
                token
            };
        } catch (error) {
            console.error('Google Auth Error Details:', error);

            // If it's already an AppError (like the 404 for missing account), re-throw it
            if (error.statusCode) {
                throw error;
            }

            throw new AppError(`Google authentication failed: ${error.message}`, 401);
        }
    }
}

module.exports = new AuthService();
