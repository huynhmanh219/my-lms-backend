// Express Application Setup
// Main application configuration and middleware setup

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter, speedLimiter } = require('./middleware/rateLimiter');
const { 
    xssProtection, 
    sqlInjectionProtection, 
    fileUploadSecurity,
    sanitizeInput,
    securityHeaders,
    mongoSanitization,
    hppProtection,
    requestSizeLimiter
} = require('./middleware/security');
const { validateSecureInput } = require('./middleware/validation');
const { requestLogger } = require('./services/loggerService');

// Import Swagger documentation
const { specs, swaggerUi, swaggerUiOptions } = require('./config/swagger');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const lectureRoutes = require('./routes/lectures');
const materialRoutes = require('./routes/materials');
const quizRoutes = require('./routes/quizzes');
const questionRoutes = require('./routes/questions');
const quizAttemptRoutes = require('./routes/quiz-attempts');
const studentRoutes = require('./routes/students');
const statisticsRoutes = require('./routes/statistics');

// Create Express application
const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware (applied early)
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https:", "data:"],
            connectSrc: ["'self'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"]
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Additional security headers
app.use(securityHeaders);

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};
app.use(cors(corsOptions));

// Request logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use(requestLogger);
    app.use(morgan('combined'));
}

// Body parsing middleware with size limits
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb',
    parameterLimit: 100
}));

// Security middleware stack
app.use(requestSizeLimiter);
app.use(hppProtection);
app.use(mongoSanitization);
app.use(xssProtection);
app.use(sqlInjectionProtection);
app.use(sanitizeInput);
app.use(validateSecureInput);

// Rate limiting
app.use(generalLimiter);
app.use(speedLimiter);

// Static files serving with security headers
app.use('/uploads', (req, res, next) => {
    // Additional security for file serving
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
}, express.static(path.join(__dirname, '../uploads')));

// Health check endpoint (before other routes)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'LMS Backend is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        uptime: Math.floor(process.uptime())
    });
});

// Security info endpoint (for development)
if (process.env.NODE_ENV === 'development') {
    app.get('/security-info', (req, res) => {
        res.status(200).json({
            status: 'success',
            security: {
                headers: {
                    helmet: 'enabled',
                    cors: 'configured',
                    xss_protection: 'enabled',
                    sql_injection_protection: 'enabled'
                },
                rate_limiting: {
                    general: '100 requests per 15 minutes',
                    auth: '5 requests per 15 minutes',
                    upload: '50 requests per hour'
                },
                validation: {
                    input_sanitization: 'enabled',
                    file_validation: 'enabled',
                    business_logic: 'enabled'
                },
                logging: {
                    request_logging: 'enabled',
                    security_logging: 'enabled',
                    audit_logging: 'enabled'
                }
            }
        });
    });
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/statistics', statisticsRoutes);

// 404 handler for undefined routes
app.use('*', notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

module.exports = app; 