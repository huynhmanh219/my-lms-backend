// Rate Limiting Middleware
// API rate limiting to prevent abuse

const rateLimit = require('express-rate-limit');

// General API rate limit
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limit for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});

// Moderate rate limit for file uploads
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // limit each IP to 50 uploads per hour
    message: {
        status: 'error',
        message: 'Too many file uploads, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Quiz attempt rate limit
const quizLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 quiz attempts per hour
    message: {
        status: 'error',
        message: 'Too many quiz attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Password reset rate limit
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset requests per hour
    message: {
        status: 'error',
        message: 'Too many password reset attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    authLimiter,
    uploadLimiter,
    quizLimiter,
    passwordResetLimiter
}; 