

const { logApp, logSecurity } = require('../services/loggerService');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    const userId = req.user ? req.user.id : null;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    logApp.error('Application error occurred', err, userId, ip);

    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = {
            status: 'error',
            message,
            statusCode: 404,
            code: 'RESOURCE_NOT_FOUND'
        };
    }

    else if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = {
            status: 'error',
            message,
            statusCode: 400,
            code: 'DUPLICATE_FIELD'
        };
    }

    else if (err.name === 'ValidationError') {
        const message = err.errors ? Object.values(err.errors).map(val => val.message).join(', ') : err.message;
        error = {
            status: 'error',
            message,
            statusCode: 400,
            code: 'VALIDATION_ERROR'
        };
    }

    else if (err.name === 'SequelizeValidationError') {
        const message = err.errors.map(e => e.message).join(', ');
        error = {
            status: 'error',
            message,
            statusCode: 400,
            code: 'DATABASE_VALIDATION_ERROR'
        };
    }

    else if (err.name === 'SequelizeUniqueConstraintError') {
        const message = 'Duplicate field value entered';
        error = {
            status: 'error',
            message,
            statusCode: 400,
            code: 'DUPLICATE_CONSTRAINT'
        };
    }

    else if (err.name === 'SequelizeForeignKeyConstraintError') {
        const message = 'Related record not found or constraint violation';
        error = {
            status: 'error',
            message,
            statusCode: 400,
            code: 'FOREIGN_KEY_CONSTRAINT'
        };
    }

    else if (err.name === 'SequelizeConnectionError') {
        const message = 'Database connection failed';
        error = {
            status: 'error',
            message,
            statusCode: 500,
            code: 'DATABASE_CONNECTION_ERROR'
        };
        logApp.error('Database connection error', err, userId, ip);
    }

    else if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = {
            status: 'error',
            message,
            statusCode: 401,
            code: 'INVALID_TOKEN'
        };
        logSecurity.securityViolation('INVALID_JWT', ip, userAgent, { error: err.message });
    }

    else if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = {
            status: 'error',
            message,
            statusCode: 401,
            code: 'TOKEN_EXPIRED'
        };
    }

    else if (err.code === 'LIMIT_FILE_SIZE') {
        const message = 'File size too large';
        error = {
            status: 'error',
            message,
            statusCode: 400,
            code: 'FILE_TOO_LARGE'
        };
    }

    else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        const message = 'Unexpected file field';
        error = {
            status: 'error',
            message,
            statusCode: 400,
            code: 'UNEXPECTED_FILE_FIELD'
        };
    }

    else if (err.code === 'LIMIT_FILE_COUNT') {
        const message = 'Too many files uploaded';
        error = {
            status: 'error',
            message,
            statusCode: 400,
            code: 'TOO_MANY_FILES'
        };
    }

    else if (err.isOperational) {
        error = {
            status: err.status || 'error',
            message: err.message,
            statusCode: err.statusCode,
            code: err.code || 'APPLICATION_ERROR'
        };
    }

    else if (err.code === 'SECURITY_VIOLATION') {
        logSecurity.securityViolation('GENERAL', ip, userAgent, { error: err.message });
        error = {
            status: 'error',
            message: 'Security violation detected',
            statusCode: 400,
            code: 'SECURITY_VIOLATION'
        };
    }

    else {
        error = {
            status: 'error',
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
            statusCode: 500,
            code: 'INTERNAL_SERVER_ERROR'
        };
    }

    if (error.statusCode === 401 || error.statusCode === 403) {
        logSecurity.accessDenied(
            userId,
            req.originalUrl,
            req.method,
            ip
        );
    }

    const response = {
        status: error.status || 'error',
        message: error.message || 'Internal Server Error',
        code: error.code || 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
        response.details = err;
    }

    if (req.id) {
        response.requestId = req.id;
    }

    res.status(error.statusCode || 500).json(response);
};

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

class AppError extends Error {
    constructor(message, statusCode, code = null) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.code = code;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}

class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

class UnauthorizedError extends AppError {
    constructor(message) {
        super(message, 401, 'UNAUTHORIZED');
        this.name = 'UnauthorizedError';
    }
}

class ForbiddenError extends AppError {
    constructor(message) {
        super(message, 403, 'FORBIDDEN');
        this.name = 'ForbiddenError';
    }
}

class SecurityError extends AppError {
    constructor(message) {
        super(message, 400, 'SECURITY_VIOLATION');
        this.name = 'SecurityError';
    }
}

class DatabaseError extends AppError {
    constructor(message) {
        super(message, 500, 'DATABASE_ERROR');
        this.name = 'DatabaseError';
    }
}
    
const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};

module.exports = {
    errorHandler,
    asyncHandler,
    notFoundHandler,
    AppError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    SecurityError,
    DatabaseError
}; 