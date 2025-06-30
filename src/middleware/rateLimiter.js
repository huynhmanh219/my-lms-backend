
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { logSecurity } = require('../services/loggerService');

const isDevelopment = process.env.NODE_ENV === 'development';


const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDevelopment ? 10000 : 100,
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
        if (req.path === '/health') return true;
        if (isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip.includes('192.168'))) {
            return true;
        }
        return false;
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDevelopment ? 50 : 5,
    message: {
        status: 'error',
        message: 'Too many authentication attempts, please try again later.',
        code: 'AUTH_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
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
    },
    skip: (req) => {
        if (isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip.includes('192.168'))) {
            return true;
        }
        return false;
    }
});

const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 50,
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

const quizLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
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

const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
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

const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 10,
    delayMs: () => 500,
    maxDelayMs: 20000,
    validate: { delayMs: false }
});

const userCreationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
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

const createKeyBasedLimiter = (maxRequests, windowMs) => {
    return rateLimit({
        windowMs,
        max: maxRequests,
        keyGenerator: (req) => {
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