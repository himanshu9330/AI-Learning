const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - Data to encode in token
 * @param {String} expiresIn - Token expiration time
 * @returns {String} JWT token
 */
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRE) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn
    });
};

/**
 * Generate refresh token
 * @param {Object} payload - Data to encode in token
 * @returns {String} Refresh token
 */
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE
    });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify refresh token
 * @param {String} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken
};
