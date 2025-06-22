// Quiz Management Routes
// Routes for managing quizzes, questions, attempts, and results

const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { auth } = require('../middleware/auth');
const { requireLecturer, requireStudent } = require('../middleware/roleCheck');
const { validateQuery, validateParams } = require('../middleware/validation');
const { commonSchemas } = require('../middleware/validation');
const { quizLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const upload = require('../config/multer');

// Quiz Management Routes
router.get('/',
    auth,
    validateQuery(commonSchemas.pagination),
    quizController.getQuizzes
);

router.get('/:id',
    auth,
    validateParams(commonSchemas.id),
    quizController.getQuiz
);

router.post('/',
    auth,
    requireLecturer,
    quizController.createQuiz
);

router.put('/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    quizController.updateQuiz
);

router.delete('/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    quizController.deleteQuiz
);

router.post('/:id/publish',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    quizController.publishQuiz
);

router.post('/:id/close',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    quizController.closeQuiz
);

// Get quiz questions (keep this one as it's quiz-specific)
router.get('/:id/questions',
    auth,
    validateParams(commonSchemas.id),
    quizController.getQuizQuestions
);

// Quiz Attempt System Routes
router.get('/:id/start',
    auth,
    requireStudent,
    validateParams(commonSchemas.id),
    quizController.startQuiz
);

// Results & Analytics Routes
router.get('/:id/results',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    quizController.getQuizResults
);

router.get('/:id/statistics',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    quizController.getQuizStatistics
);

module.exports = router; 