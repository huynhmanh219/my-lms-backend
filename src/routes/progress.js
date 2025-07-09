const express = require('express');
const router = express.Router();

const { auth } = require('../middleware/auth');
const { requireStudent } = require('../middleware/roleCheck');
const progressController = require('../controllers/progressController');

router.post('/lectures/:id/start', auth, requireStudent, progressController.startLecture);
router.put('/lectures/:id/progress', auth, requireStudent, progressController.updateLecture);
router.get('/lectures/:id/progress', auth, requireStudent, progressController.getLectureProgress);

router.get('/course-sections/:id/progress', auth, requireStudent, progressController.getSectionProgressForStudent);

module.exports = router; 