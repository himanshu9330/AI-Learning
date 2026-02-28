class AppError extends Error {
    constructor(message, statusCode, isOperational = true, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = isOperational;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
