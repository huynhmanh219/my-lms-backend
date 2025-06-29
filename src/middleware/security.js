// Security Middleware
// Comprehensive security measures for API protection

const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const validator = require('validator');
const sanitizeHtml = require('sanitize-html');
const path = require('path');

// XSS Protection Middleware (custom implementation since xss-clean is deprecated)
const xssProtection = (req, res, next) => {
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        
        // Use sanitize-html to clean the string
        return sanitizeHtml(str, {
            allowedTags: [], // No HTML tags allowed
            allowedAttributes: {},
            disallowedTagsMode: 'discard'
        });
    };

    const sanitizeObject = (obj) => {
        if (obj && typeof obj === 'object') {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'string') {
                        obj[key] = sanitizeString(obj[key]);
                    } else if (typeof obj[key] === 'object') {
                        sanitizeObject(obj[key]);
                    }
                }
            }
        }
    };

    // Sanitize request body
    if (req.body) {
        sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
        sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params) {
        sanitizeObject(req.params);
    }

    next();
};

// SQL Injection Prevention
const sqlInjectionProtection = (req, res, next) => {
    const checkForSQLInjection = (value) => {
        if (typeof value !== 'string') return false;
        
        const sqlInjectionPatterns = [
            /(\bunion\b|\bselect\b|\binsert\b|\bdelete\b|\bdrop\b|\bcreate\b|\balter\b|\bupdate\b)/i,
            /(\bor\b|\band\b)\s+\d+\s*=\s*\d+/i,
            /['"]\s*(or|and)\s+['"]/i,
            /['"]\s*;\s*(drop|insert|delete|update|create|alter)/i,
            /\/\*|\*\//,
            /--/,
            /#/
        ];
        
        return sqlInjectionPatterns.some(pattern => pattern.test(value));
    };

    const checkObject = (obj) => {
        if (obj && typeof obj === 'object') {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'string' && checkForSQLInjection(obj[key])) {
                        return true;
                    } else if (typeof obj[key] === 'object' && checkObject(obj[key])) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    // Check all input sources for SQL injection attempts
    if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid input detected. Request blocked for security reasons.',
            code: 'SECURITY_VIOLATION'
        });
    }

    next();
};

// File Upload Security Middleware
const fileUploadSecurity = (req, res, next) => {
    if (!req.file && !req.files) {
        return next();
    }

    const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'text/plain'
    ];

    const maxFileSize = 50 * 1024 * 1024; // 50MB

    const validateFile = (file) => {
        if (file.size > maxFileSize) {
            throw new Error(`File ${file.originalname} exceeds maximum size of 50MB`);
        }

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new Error(`File type ${file.mimetype} is not allowed for ${file.originalname}`);
        }
    };

    try {
        if (req.file) {
            validateFile(req.file);
        }

        if (req.files) {
            const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
            files.forEach(validateFile);
        }

        next();
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: error.message,
            code: 'FILE_VALIDATION_FAILED'
        });
    }
};

// Request Size Limiting
const requestSizeLimiter = (req, res, next) => {
    const maxBodySize = 10 * 1024 * 1024; // 10MB
    const maxQueryParams = 100;
    const maxHeaderSize = 8192; // 8KB

    // Check body size (already handled by express.json limit, but double-check)
    if (req.get('content-length') && parseInt(req.get('content-length')) > maxBodySize) {
        return res.status(413).json({
            status: 'error',
            message: 'Request body too large',
            code: 'REQUEST_TOO_LARGE'
        });
    }

    // Check number of query parameters
    if (Object.keys(req.query).length > maxQueryParams) {
        return res.status(400).json({
            status: 'error',
            message: 'Too many query parameters',
            code: 'TOO_MANY_PARAMETERS'
        });
    }

    // Check header size
    const headerSize = JSON.stringify(req.headers).length;
    if (headerSize > maxHeaderSize) {
        return res.status(400).json({
            status: 'error',
            message: 'Request headers too large',
            code: 'HEADERS_TOO_LARGE'
        });
    }

    next();
};

// Input Sanitization for specific fields
const sanitizeInput = (req, res, next) => {
    const sanitizeEmail = (email) => {
        if (!email || typeof email !== 'string') return email;
        return validator.normalizeEmail(email, {
            gmail_lowercase: true,
            gmail_remove_dots: false,
            gmail_remove_subaddress: false
        });
    };

    const sanitizeNumericId = (id) => {
        if (!id) return id;
        const numId = parseInt(id);
        return isNaN(numId) || numId <= 0 ? null : numId;
    };

    // Sanitize common fields
    if (req.body) {
        if (req.body.email) {
            req.body.email = sanitizeEmail(req.body.email);
        }
        
        // Sanitize numeric IDs (but not student_id in body as it's a student code string)
        ['id', 'user_id', 'lecturer_id', 'subject_id', 'course_id', 'chapter_id', 'quiz_id'].forEach(field => {
            if (req.body[field]) {
                req.body[field] = sanitizeNumericId(req.body[field]);
            }
        });
    }

    if (req.params) {
        Object.keys(req.params).forEach(key => {
            if (key === 'id' || key.endsWith('Id')) {
                req.params[key] = sanitizeNumericId(req.params[key]);
            }
        });
    }

    next();
};

// Security Headers Middleware
const securityHeaders = (req, res, next) => {
    // Additional security headers beyond Helmet
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Remove server information
    res.removeHeader('X-Powered-By');
    
    next();
};

// MongoDB sanitization wrapper
const mongoSanitization = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Request sanitized. Key: ${key}, IP: ${req.ip}`);
    }
});

// HTTP Parameter Pollution protection
const hppProtection = hpp({
    whitelist: ['sort', 'fields', 'page', 'limit', 'search'] // Allow these parameters to be arrays
});

module.exports = {
    xssProtection,
    sqlInjectionProtection,
    fileUploadSecurity,
    requestSizeLimiter,
    sanitizeInput,
    securityHeaders,
    mongoSanitization,
    hppProtection
}; 