// Rate Limiting Middleware
// API rate limiting to prevent abuse

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { logSecurity } = require('../services/loggerService');

// Enhanced general API rate limit with logging
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logSecurity.rateLimitExceeded(
            req.ip, 
            req.originalUrl, 
            req.get('User-Agent')
        );
        res.status(429).json({
            status: 'error',
            message: 'Too many requests from this IP, please try again later.',
            code: 'RATE_LIMIT_EXCEEDED'
        });
    },
    skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/health';
    }
});

// Strict rate limit for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        status: 'error',
        message: 'Too many authentication attempts, please try again later.',
        code: 'AUTH_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    handler: (req, res) => {
        logSecurity.rateLimitExceeded(
            req.ip, 
            'authentication', 
            req.get('User-Agent')
        );
        res.status(429).json({
            status: 'error',
            message: 'Too many authentication attempts, please try again later.',
            code: 'AUTH_LIMIT_EXCEEDED'
        });
    }
});

// Moderate rate limit for file uploads
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // limit each IP to 50 uploads per hour
    message: {
        status: 'error',
        message: 'Too many file uploads, please try again later.',
        code: 'UPLOAD_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logSecurity.rateLimitExceeded(
            req.ip, 
            'file-upload', 
            req.get('User-Agent')
        );
        res.status(429).json({
            status: 'error',
            message: 'Too many file uploads, please try again later.',
            code: 'UPLOAD_LIMIT_EXCEEDED'
        });
    }
});

// Quiz attempt rate limit
const quizLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 quiz attempts per hour
    message: {
        status: 'error',
        message: 'Too many quiz attempts, please try again later.',
        code: 'QUIZ_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logSecurity.rateLimitExceeded(
            req.ip, 
            'quiz-attempt', 
            req.get('User-Agent')
        );
        res.status(429).json({
            status: 'error',
            message: 'Too many quiz attempts, please try again later.',
            code: 'QUIZ_LIMIT_EXCEEDED'
        });
    }
});

// Password reset rate limit
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 password reset requests per hour
    message: {
        status: 'error',
        message: 'Too many password reset attempts, please try again later.',
        code: 'PASSWORD_RESET_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logSecurity.rateLimitExceeded(
            req.ip, 
            'password-reset', 
            req.get('User-Agent')
        );
        res.status(429).json({
            status: 'error',
            message: 'Too many password reset attempts, please try again later.',
            code: 'PASSWORD_RESET_LIMIT_EXCEEDED'
        });
    }
});

// Speed limiter for API endpoints (fixed for v2 compatibility)
const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 10, // Allow 10 requests per window without delay
    delayMs: () => 500, // New syntax: fixed delay per request
    maxDelayMs: 20000, // Maximum delay of 20 seconds
    validate: { delayMs: false } // Disable validation warning
});

// Strict rate limit for user creation
const userCreationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 user creation requests per hour
    message: {
        status: 'error',
        message: 'Too many user creation attempts, please try again later.',
        code: 'USER_CREATION_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logSecurity.rateLimitExceeded(
            req.ip, 
            'user-creation', 
            req.get('User-Agent')
        );
        res.status(429).json({
            status: 'error',
            message: 'Too many user creation attempts, please try again later.',
            code: 'USER_CREATION_LIMIT_EXCEEDED'
        });
    }
});

// API key based rate limiting for potential external integrations
const createKeyBasedLimiter = (maxRequests, windowMs) => {
    return rateLimit({
        windowMs,
        max: maxRequests,
        keyGenerator: (req) => {
            // Use API key if present, otherwise fall back to IP
            return req.headers['x-api-key'] || req.ip;
        },
        message: {
            status: 'error',
            message: 'API rate limit exceeded',
            code: 'API_LIMIT_EXCEEDED'
        },
        standardHeaders: true,
        legacyHeaders: false
    });
};

module.exports = {
    generalLimiter,
    authLimiter,
    uploadLimiter,
    quizLimiter,
    passwordResetLimiter,
    speedLimiter,
    userCreationLimiter,
    createKeyBasedLimiter
}; 