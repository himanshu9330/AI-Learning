const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        return next(new AppError('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request (you can fetch full user from DB here)
        req.user = decoded;

        next();
    } catch (error) {
        return next(new AppError('Not authorized to access this route', 401));
    }
});

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    `User role '${req.user.role}' is not authorized to access this route`,
                    403
                )
            );
        }
        next();
    };
};

module.exports = { protect, authorize };
