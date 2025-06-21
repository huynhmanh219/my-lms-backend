// Global Error Handler Middleware
// Centralized error handling and logging

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    console.error(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = {
            status: 'error',
            message,
            statusCode: 404
        };
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = {
            status: 'error',
            message,
            statusCode: 400
        };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = {
            status: 'error',
            message,
            statusCode: 400
        };
    }

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        const message = err.errors.map(e => e.message).join(', ');
        error = {
            status: 'error',
            message,
            statusCode: 400
        };
    }

    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        const message = 'Duplicate field value entered';
        error = {
            status: 'error',
            message,
            statusCode: 400
        };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = {
            status: 'error',
            message,
            statusCode: 401
        };
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = {
            status: 'error',
            message,
            statusCode: 401
        };
    }

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        const message = 'File size too large';
        error = {
            status: 'error',
            message,
            statusCode: 400
        };
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        const message = 'Unexpected file field';
        error = {
            status: 'error',
            message,
            statusCode: 400
        };
    }

    res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = {
    errorHandler,
    asyncHandler,
    AppError
}; 