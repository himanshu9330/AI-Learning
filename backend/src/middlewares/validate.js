const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg
        }));

        return next(new AppError(
            'Validation failed',
            400,
            true,
            errorMessages
        ));
    }

    next();
};

module.exports = validate;
