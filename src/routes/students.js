const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const courseController = require('../controllers/courseController');
const { auth } = require('../middleware/auth');
const { validateParams, validateQuery } = require('../middleware/validation');
const { commonSchemas } = require('../middleware/validation');

// GET /students/me/classes - Get current student's classes
router.get('/me/classes',
    auth,
    validateQuery(commonSchemas.pagination),
    courseController.getCurrentStudentClasses
);

router.get('/:id/quiz-history',
    auth,
    validateParams(commonSchemas.id),
    validateQuery(commonSchemas.pagination),
    quizController.getStudentQuizHistory
);

module.exports = router; 