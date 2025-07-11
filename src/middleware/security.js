﻿
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const validator = require('validator');
const sanitizeHtml = require('sanitize-html');
const path = require('path');


const xssProtection = (req, res, next) => {
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        
        return sanitizeHtml(str, {
            allowedTags: [],
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


    if (req.body) {
        sanitizeObject(req.body);
    }


    if (req.query) {
        sanitizeObject(req.query);
    }


    if (req.params) {
        sanitizeObject(req.params);
    }

    next();
};


const sqlInjectionProtection = (req, res, next) => {
    const checkForSQLInjection = (value, fieldName = '', route = '') => {
        if (typeof value !== 'string') return false;
        

        const contentFields = ['content', 'description', 'message'];
        const lectureRoutes = ['/api/lectures', '/api/materials'];
        
        if (contentFields.includes(fieldName) && 
            lectureRoutes.some(routePattern => route.startsWith(routePattern))) {

            const strictSqlPatterns = [
                /(\bunion\b|\bselect\b|\binsert\b|\bdelete\b|\bdrop\b|\bcreate\b|\balter\b|\bupdate\b)\s+.*\s+(\bfrom\b|\binto\b|\bwhere\b|\bset\b)/i,
                /['"']\s*;\s*(drop|insert|delete|update|create|alter)/i,
                /(\bor\b|\band\b)\s+\d+\s*=\s*\d+\s*(--|\#)/i,
                /['"']\s*(or|and)\s+['"']\s*=\s*['"']/i
            ];
            return strictSqlPatterns.some(pattern => pattern.test(value));
        } else {

            const sqlInjectionPatterns = [
                /(\bunion\b|\bselect\b|\binsert\b|\bdelete\b|\bdrop\b|\bcreate\b|\balter\b|\bupdate\b)/i,
                /(\bor\b|\band\b)\s+\d+\s*=\s*\d+/i,
                /['"']\s*(or|and)\s+['"']/i,
                /['"']\s*;\s*(drop|insert|delete|update|create|alter)/i,
                /\/\*|\*\//,
                /--/,
                /#/
            ];
            return sqlInjectionPatterns.some(pattern => pattern.test(value));
        }
    };

    const checkObject = (obj, route = '') => {
        if (obj && typeof obj === 'object') {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'string' && checkForSQLInjection(obj[key], key, route)) {
                        return true;
                    } else if (typeof obj[key] === 'object' && checkObject(obj[key], route)) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const currentRoute = req.path || req.url;


    if (checkObject(req.body, currentRoute) || 
        checkObject(req.query, currentRoute) || 
        checkObject(req.params, currentRoute)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid input detected. Request blocked for security reasons.',
            code: 'SECURITY_VIOLATION'
        });
    }

    next();
};



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

    const maxFileSize = 50 * 1024 * 1024;

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

const requestSizeLimiter = (req, res, next) => {
    const maxBodySize = 10 * 1024 * 1024;
    const maxQueryParams = 100;
    const maxHeaderSize = 8192;

    if (req.get('content-length') && parseInt(req.get('content-length')) > maxBodySize) {
        return res.status(413).json({
            status: 'error',
            message: 'Request body too large',
            code: 'REQUEST_TOO_LARGE'
        });
    }

    if (Object.keys(req.query).length > maxQueryParams) {
        return res.status(400).json({
            status: 'error',
            message: 'Too many query parameters',
            code: 'TOO_MANY_PARAMETERS'
        });
    }

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

    if (req.body) {
        if (req.body.email) {
            req.body.email = sanitizeEmail(req.body.email);
        }
        
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

const securityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.removeHeader('X-Powered-By');
    next();
};

const mongoSanitization = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Request sanitized. Key: ${key}, IP: ${req.ip}`);
    }
});

const hppProtection = hpp({
    whitelist: ['sort', 'fields', 'page', 'limit', 'search']
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

