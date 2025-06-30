
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { auth } = require('../middleware/auth');
const { validateParams, validateQuery } = require('../middleware/validation');
const { commonSchemas } = require('../middleware/validation');


router.get('/:id/quiz-history',
    auth,
    validateParams(commonSchemas.id),
    validateQuery(commonSchemas.pagination),
    quizController.getStudentQuizHistory
);

module.exports = router; 