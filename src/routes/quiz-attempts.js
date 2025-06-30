
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { auth } = require('../middleware/auth');
const { requireStudent } = require('../middleware/roleCheck');
const { validateParams, validateQuery } = require('../middleware/validation');
const { commonSchemas } = require('../middleware/validation');
const { quizLimiter } = require('../middleware/rateLimiter');

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

router.get('/my-attempts',
    auth,
    requireStudent,
    validateQuery(commonSchemas.pagination),
    quizController.getMyAttempts
);

module.exports = router; 