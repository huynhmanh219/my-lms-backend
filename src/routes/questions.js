

const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { auth } = require('../middleware/auth');
const { requireLecturer } = require('../middleware/roleCheck');
const { validateParams } = require('../middleware/validation');
const { commonSchemas } = require('../middleware/validation');
const { uploadLimiter } = require('../middleware/rateLimiter');
const upload = require('../config/multer');


router.get('/:id',
    auth,
    validateParams(commonSchemas.id),
    quizController.getQuestion
);

router.post('/',
    auth,
    requireLecturer,
    quizController.createQuestion
);

router.put('/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    quizController.updateQuestion
);

router.delete('/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    quizController.deleteQuestion
);

router.post('/import',
    auth,
    requireLecturer,
    uploadLimiter,
    upload.single('file'),
    quizController.importQuestions
);

router.get('/export',
    auth,
    requireLecturer,
    quizController.exportQuestions
);

module.exports = router; 