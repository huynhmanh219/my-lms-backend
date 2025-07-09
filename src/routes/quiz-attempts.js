const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { auth } = require('../middleware/auth');
const { requireStudent } = require('../middleware/roleCheck');
const { validateParams, validateQuery } = require('../middleware/validation');
const { commonSchemas, quizSchemas } = require('../middleware/validation');
const { quizLimiter } = require('../middleware/rateLimiter');
router.get('/my-attempts', auth, requireStudent, quizController.getMyAttempts);

router.post('/',
    auth,
    requireStudent,
    quizLimiter,
    quizController.createQuizAttempt
);

router.get('/:id',
    auth,
    validateParams(commonSchemas.id),
    quizController.getQuizAttempt
);

router.put('/:id/answer',
    auth,
    requireStudent,
    validateParams(commonSchemas.id),
    quizController.submitAnswer
);

router.post('/:id/flag',
    auth,
    requireStudent,
    validateParams(commonSchemas.id),
    quizController.flagQuestion
);

router.post('/:id/submit',
    auth,
    requireStudent,
    validateParams(commonSchemas.id),
    quizController.submitQuizAttempt
);

router.get('/:id/progress',
    auth,
    validateParams(commonSchemas.id),
    quizController.getQuizProgress
);


router.get('/:id/result',
    auth,
    validateParams(commonSchemas.id),
    quizController.getAttemptResult
);

// Test route - bypass all validation
router.get('/test-my-attempts',
    auth,
    requireStudent,
    quizController.getMyAttempts
);

// Temporarily disable validation for testing
// router.get('/my-attempts',
//     auth,
//     requireStudent,
//     // validateQuery(quizSchemas.quizAttemptPagination),
//     quizController.getMyAttempts
// );

// NEW: Complete replacement without validation
router.get('/my-attempts', auth, requireStudent, async (req, res) => {
    try {
        console.log('🔍 NEW MY-ATTEMPTS: Query params:', req.query);
        console.log('🔍 NEW MY-ATTEMPTS: User:', req.user?.id);
        
        const { page = 1, size = 10, limit, status, quiz_id } = req.query;
        // Use limit if provided, otherwise use size, default to 10
        const pageSize = limit || size || 10;
        const userId = req.user.id;

        console.log('🔍 NEW MY-ATTEMPTS: Processed parameters:', { page, size, limit, pageSize, status, quiz_id });

        const { Submission, Quiz, Student, Subject } = require('../models');
        
        const student = await Student.findOne({ where: { account_id: userId } });
        if (!student) {
            return res.status(403).json({
                success: false,
                message: 'Only students can view quiz attempts'
            });
        }

        console.log('🔍 NEW MY-ATTEMPTS: Found student:', student.id);

        const whereConditions = { student_id: student.id };
        if (status) {
            whereConditions.status = status;
        }
        if (quiz_id) {
            whereConditions.quiz_id = quiz_id;
        }

        console.log('🔍 NEW MY-ATTEMPTS: Where conditions:', whereConditions);

        const submissions = await Submission.findAll({
            where: whereConditions,
            include: [
                {
                    model: Quiz,
                    as: 'quiz',
                    attributes: ['id', 'title', 'total_points', 'passing_score'],
                    include: [
                        {
                            model: Subject,
                            as: 'subject',
                            attributes: ['id', 'subject_name', 'subject_code']
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(pageSize)
        });

        console.log('🔍 NEW MY-ATTEMPTS: Found submissions:', submissions.length);

        const response = {
            results: submissions,
            count: submissions.length,
            page: parseInt(page),
            totalPages: 1
        };

        res.status(200).json({
            success: true,
            message: 'My quiz attempts retrieved successfully',
            data: response
        });
    } catch (error) {
        console.error('❌ NEW MY-ATTEMPTS error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// DEBUG: Test route with no validation
router.get('/debug-attempts',
    auth,
    quizController.getMyAttempts
);

// BYPASS: Complete bypass route for testing
router.get('/bypass-attempts', async (req, res) => {
    try {
        console.log('BYPASS: Getting attempts with query:', req.query);
        const userId = req.user.id;
        const { quiz_id } = req.query;
        
        const { Submission, Quiz, Student, Subject } = require('../models');
        
        const student = await Student.findOne({ where: { account_id: userId } });
        if (!student) {
            return res.json({
                success: true,
                message: 'No student found',
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
                    attributes: ['id', 'title', 'total_points', 'passing_score']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        console.log('BYPASS: Found submissions:', submissions.length);
        
        res.json({
            success: true,
            message: 'Attempts retrieved successfully',
            data: submissions
        });
    } catch (error) {
        console.error('BYPASS: Error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            data: []
        });
    }
});

// FULL BYPASS: No middleware at all
router.get('/full-bypass', (req, res) => {
    res.json({
        success: true,
        message: 'Full bypass working',
        query: req.query,
        user: req.user?.id || 'no user',
        data: []
    });
});

// TEST: Simple test route 
router.get('/test-simple', auth, (req, res) => {
    res.json({
        success: true,
        message: 'Simple test route working',
        query: req.query,
        user: req.user?.id || 'no user'
    });
});

// TEST: Complete bypass route for debugging
router.get('/debug-no-validation', auth, async (req, res) => {
    try {
        console.log('🔍 DEBUG NO VALIDATION: Query params:', req.query);
        console.log('🔍 DEBUG NO VALIDATION: User:', req.user?.id);
        
        const { quiz_id } = req.query;
        const userId = req.user.id;
        
        const { Submission, Quiz, Student, Subject } = require('../models');
        
        const student = await Student.findOne({ where: { account_id: userId } });
        if (!student) {
            return res.json({
                success: false,
                message: 'Student not found',
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

        console.log('🔍 DEBUG NO VALIDATION: Found submissions:', submissions.length);
        
        res.json({
            success: true,
            message: 'Debug route working',
            data: submissions
        });
    } catch (error) {
        console.error('🔍 DEBUG NO VALIDATION: Error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            data: []
        });
    }
});

// SIMPLE TEST: Just return static data
router.get('/simple-test', (req, res) => {
    res.json({
        success: true,
        message: 'Simple test working',
        data: []
    });
});

module.exports = router; 