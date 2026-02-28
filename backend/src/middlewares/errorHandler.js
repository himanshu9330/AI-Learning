const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;

    // Log error
    logger.error({
        message: error.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        statusCode: error.statusCode
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new AppError(message, 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} already exists`;
        error = new AppError(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        const message = `Validation Error: ${errors.join(', ')}`;
        error = new AppError(message, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new AppError(message, 401);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new AppError(message, 401);
    }

    // Send error response
    res.status(error.statusCode).json({
        status: error.status || 'error',
        message: error.message || 'Internal Server Error',
        errors: error.errors || err.errors || [], // Include detailed errors
        ...(process.env.NODE_ENV === 'development' && {
            error: err,
            stack: err.stack
        })
    });
};

module.exports = errorHandler;
