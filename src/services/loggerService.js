

const winston = require('winston');
const path = require('path');


const fs = require('fs');
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}


const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, service, userId, ip, userAgent, ...meta }) => {
        let logMessage = `${timestamp} [${level.toUpperCase()}]`;
        
        if (service) logMessage += ` [${service}]`;
        if (userId) logMessage += ` [User:${userId}]`;
        if (ip) logMessage += ` [IP:${ip}]`;
        
        logMessage += `: ${message}`;
        
        if (Object.keys(meta).length > 0) {
            logMessage += ` ${JSON.stringify(meta)}`;
        }
        
        return logMessage;
    })
);


const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'lms-backend' },
    transports: [

        new winston.transports.File({ 
            filename: path.join(logDir, 'error.log'), 
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5
        }),
        

        new winston.transports.File({ 
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5
        }),
        

        new winston.transports.File({ 
            filename: path.join(logDir, 'security.log'),
            level: 'warn',
            maxsize: 5242880,
            maxFiles: 10
        }),
        

        new winston.transports.File({ 
            filename: path.join(logDir, 'audit.log'),
            maxsize: 5242880,
            maxFiles: 10
        })
    ]
});


if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}


const logSecurity = {

    loginAttempt: (email, ip, userAgent, success = false) => {
        logger.warn('Login attempt', {
            event: 'LOGIN_ATTEMPT',
            email,
            ip,
            userAgent,
            success,
            timestamp: new Date().toISOString()
        });
    },
    
    loginSuccess: (userId, email, ip, userAgent) => {
        logger.info('Successful login', {
            event: 'LOGIN_SUCCESS',
            userId,
            email,
            ip,
            userAgent,
            timestamp: new Date().toISOString()
        });
    },
    
    loginFailure: (email, ip, userAgent, reason) => {
        logger.warn('Failed login', {
            event: 'LOGIN_FAILURE',
            email,
            ip,
            userAgent,
            reason,
            timestamp: new Date().toISOString()
        });
    },
    
    logout: (userId, ip) => {
        logger.info('User logout', {
            event: 'LOGOUT',
            userId,
            ip,
            timestamp: new Date().toISOString()
        });
    },
    

    securityViolation: (type, ip, userAgent, details) => {
        logger.error('Security violation detected', {
            event: 'SECURITY_VIOLATION',
            type,
            ip,
            userAgent,
            details,
            timestamp: new Date().toISOString()
        });
    },
    
    rateLimitExceeded: (ip, endpoint, userAgent) => {
        logger.warn('Rate limit exceeded', {
            event: 'RATE_LIMIT_EXCEEDED',
            ip,
            endpoint,
            userAgent,
            timestamp: new Date().toISOString()
        });
    },
    
    suspiciousActivity: (userId, activity, ip, details) => {
        logger.warn('Suspicious activity detected', {
            event: 'SUSPICIOUS_ACTIVITY',
            userId,
            activity,
            ip,
            details,
            timestamp: new Date().toISOString()
        });
    },
    

    fileUpload: (userId, filename, size, mimetype, ip) => {
        logger.info('File uploaded', {
            event: 'FILE_UPLOAD',
            userId,
            filename,
            size,
            mimetype,
            ip,
            timestamp: new Date().toISOString()
        });
    },
    
    fileDownload: (userId, filename, ip) => {
        logger.info('File downloaded', {
            event: 'FILE_DOWNLOAD',
            userId,
            filename,
            ip,
            timestamp: new Date().toISOString()
        });
    },
    

    accessDenied: (userId, resource, action, ip) => {
        logger.warn('Access denied', {
            event: 'ACCESS_DENIED',
            userId,
            resource,
            action,
            ip,
            timestamp: new Date().toISOString()
        });
    }
};


const logAudit = {

    create: (userId, entity, entityId, data, ip) => {
        logger.info('Entity created', {
            event: 'CREATE',
            userId,
            entity,
            entityId,
            data: JSON.stringify(data),
            ip,
            timestamp: new Date().toISOString()
        });
    },
    
    update: (userId, entity, entityId, changes, ip) => {
        logger.info('Entity updated', {
            event: 'UPDATE',
            userId,
            entity,
            entityId,
            changes: JSON.stringify(changes),
            ip,
            timestamp: new Date().toISOString()
        });
    },
    
    delete: (userId, entity, entityId, ip) => {
        logger.warn('Entity deleted', {
            event: 'DELETE',
            userId,
            entity,
            entityId,
            ip,
            timestamp: new Date().toISOString()
        });
    },
    

    quizStart: (userId, quizId, ip) => {
        logger.info('Quiz started', {
            event: 'QUIZ_START',
            userId,
            quizId,
            ip,
            timestamp: new Date().toISOString()
        });
    },
    
    quizSubmit: (userId, quizId, attemptId, score, ip) => {
        logger.info('Quiz submitted', {
            event: 'QUIZ_SUBMIT',
            userId,
            quizId,
            attemptId,
            score,
            ip,
            timestamp: new Date().toISOString()
        });
    },
    

    roleChange: (adminId, targetUserId, oldRole, newRole, ip) => {
        logger.warn('User role changed', {
            event: 'ROLE_CHANGE',
            adminId,
            targetUserId,
            oldRole,
            newRole,
            ip,
            timestamp: new Date().toISOString()
        });
    },
    
    accountStatus: (adminId, targetUserId, action, ip) => {
        logger.warn('Account status changed', {
            event: 'ACCOUNT_STATUS_CHANGE',
            adminId,
            targetUserId,
            action,
            ip,
            timestamp: new Date().toISOString()
        });
    }
};


const logApp = {
    error: (message, error, userId = null, ip = null) => {
        logger.error(message, {
            error: error ? error.message : null,
            stack: error ? error.stack : null,
            userId,
            ip,
            timestamp: new Date().toISOString()
        });
    },
    
    warn: (message, meta = {}) => {
        logger.warn(message, {
            ...meta,
            timestamp: new Date().toISOString()
        });
    },
    
    info: (message, meta = {}) => {
        logger.info(message, {
            ...meta,
            timestamp: new Date().toISOString()
        });
    },
    
    debug: (message, meta = {}) => {
        logger.debug(message, {
            ...meta,
            timestamp: new Date().toISOString()
        });
    }
};


const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    

    logger.info('Request received', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user ? req.user.id : null,
        timestamp: new Date().toISOString()
    });
    
        
    const originalJson = res.json;
    res.json = function(data) {
        const duration = Date.now() - startTime;
        
        logger.info('Response sent', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userId: req.user ? req.user.id : null,
            timestamp: new Date().toISOString()
        });
        
        return originalJson.call(this, data);
    };
    
    next();
};

module.exports = {
    logger,
    logSecurity,
    logAudit,
    logApp,
    requestLogger
}; 