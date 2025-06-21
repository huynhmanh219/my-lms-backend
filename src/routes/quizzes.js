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

// Question Management Routes
router.get('/:id/questions',
    auth,
    validateParams(commonSchemas.id),
    quizController.getQuizQuestions
);

router.get('/questions/:id',
    auth,
    validateParams(commonSchemas.id),
    quizController.getQuestion
);

router.post('/questions',
    auth,
    requireLecturer,
    quizController.createQuestion
);

router.put('/questions/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    quizController.updateQuestion
);

router.delete('/questions/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    quizController.deleteQuestion
);

router.post('/questions/import',
    auth,
    requireLecturer,
    uploadLimiter,
    upload.single('file'),
    quizController.importQuestions
);

router.get('/questions/export',
    auth,
    requireLecturer,
    quizController.exportQuestions
);

// Quiz Attempt System Routes
router.get('/:id/start',
    auth,
    requireStudent,
    validateParams(commonSchemas.id),
    quizController.startQuiz
);

router.post('/attempts',
    auth,
    requireStudent,
    quizLimiter,
    quizController.createQuizAttempt
);

router.get('/attempts/:id',
    auth,
    validateParams(commonSchemas.id),
    quizController.getQuizAttempt
);

router.put('/attempts/:id/answer',
    auth,
    requireStudent,
    validateParams(commonSchemas.id),
    quizController.submitAnswer
);

router.post('/attempts/:id/flag',
    auth,
    requireStudent,
    validateParams(commonSchemas.id),
    quizController.flagQuestion
);

router.get('/attempts/:id/progress',
    auth,
    validateParams(commonSchemas.id),
    quizController.getQuizProgress
);

// Results & Analytics Routes
router.get('/:id/results',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    quizController.getQuizResults
);

router.get('/attempts/:id/result',
    auth,
    validateParams(commonSchemas.id),
    quizController.getAttemptResult
);

router.get('/my-attempts',
    auth,
    requireStudent,
    quizController.getMyAttempts
);

router.get('/:id/statistics',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    quizController.getQuizStatistics
);

router.get('/students/:id/history',
    auth,
    validateParams(commonSchemas.id),
    quizController.getStudentQuizHistory
);

module.exports = router; 