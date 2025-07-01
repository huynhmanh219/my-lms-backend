const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter, speedLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const lectureRoutes = require('./routes/lectures');
const materialRoutes = require('./routes/materials');
const quizRoutes = require('./routes/quizzes');
const questionRoutes = require('./routes/questions');
const quizAttemptRoutes = require('./routes/quiz-attempts');
const studentRoutes = require('./routes/students');
const lecturerRoutes = require('./routes/lecturers');
const statisticsRoutes = require('./routes/statistics');

const app = express();

// SIMPLIFIED HELMET - NO CORS ISSUES
app.use(helmet({
    crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: process.env.NODE_ENV === 'development' ? false : {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "http://localhost:3000", "blob:"],
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

// CORS CONFIG  
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(generalLimiter);
app.use(speedLimiter);

// UPLOADS WITH CORS FIX
app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    next();
}, express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => {
    res.json({ status: 'success', message: 'LMS Backend - CORS FIXED' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/lecturers', lecturerRoutes);
app.use('/api/statistics', statisticsRoutes);

app.use('*', notFoundHandler);
app.use(errorHandler);

module.exports = app;
