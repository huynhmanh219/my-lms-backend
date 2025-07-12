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
const lectureRatingRoutes = require('./routes/lecture-ratings');
const classRatingRoutes = require('./routes/class-ratings');
const progressRoutes = require('./routes/progress');
const chatRoutes = require('./routes/chat');

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

// DEBUG: Direct route for testing quiz attempts - NO AUTH
app.get('/api/debug-direct', async (req, res) => {
    try {
        console.log('DEBUG DIRECT: Getting quiz attempts directly');
        const { quiz_id } = req.query;
        
        const { Submission, Quiz, Student, Account } = require('./models');
        
        // Find student SV010 directly
        const account = await Account.findOne({ where: { email: 'SV010@lms.com' } });
        if (!account) {
            return res.json({
                success: false,
                message: 'Student account not found',
                data: []
            });
        }
        
        const student = await Student.findOne({ where: { account_id: account.id } });
        if (!student) {
            return res.json({
                success: false,
                message: 'Student record not found',
                data: []
            });
        }

        const whereConditions = { student_id: student.id };
        if (quiz_id) {
            whereConditions.quiz_id = parseInt(quiz_id);
        }

        const submissions = await Submission.findAll({
            where: whereConditions,
            include: [
                {
                    model: Quiz,
                    as: 'quiz',
                    attributes: ['id', 'title', 'total_points', 'passing_score', 'attempts_allowed']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        console.log('DEBUG DIRECT: Found submissions:', submissions.length);
        
        res.json({
            success: true,
            message: 'Direct access successful',
            studentInfo: {
                account_id: account.id,
                student_id: student.id,
                email: account.email
            },
            query: req.query,
            data: submissions
        });
    } catch (error) {
        console.error('DEBUG DIRECT: Error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            data: []
        });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/lecture-ratings', lectureRatingRoutes);
app.use('/api/class-ratings', classRatingRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/lecturers', lecturerRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api', chatRoutes);

app.use('*', notFoundHandler);
app.use(errorHandler);

module.exports = app;
