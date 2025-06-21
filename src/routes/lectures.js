// Lecture Management Routes
// Routes for managing lectures, chapters, and permissions

const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/lectureController');
const { auth } = require('../middleware/auth');
const { requireLecturer, requireCourseInstructor } = require('../middleware/roleCheck');
const { validateQuery, validateParams } = require('../middleware/validation');
const { commonSchemas } = require('../middleware/validation');

// Lecture Management Routes
router.get('/',
    auth,
    validateQuery(commonSchemas.pagination),
    lectureController.getLectures
);

router.get('/:id',
    auth,
    validateParams(commonSchemas.id),
    lectureController.getLecture
);

router.post('/',
    auth,
    requireLecturer,
    lectureController.createLecture
);

router.put('/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    lectureController.updateLecture
);

router.delete('/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    lectureController.deleteLecture
);

router.get('/:id/attachments',
    auth,
    validateParams(commonSchemas.id),
    lectureController.getLectureAttachments
);

// Chapter Management Routes
router.get('/chapters',
    auth,
    validateQuery(commonSchemas.pagination),
    lectureController.getChapters
);

router.get('/chapters/:id',
    auth,
    validateParams(commonSchemas.id),
    lectureController.getChapter
);

router.post('/chapters',
    auth,
    requireLecturer,
    lectureController.createChapter
);

router.put('/chapters/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    lectureController.updateChapter
);

router.delete('/chapters/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    lectureController.deleteChapter
);

router.get('/chapters/:id/lectures',
    auth,
    validateParams(commonSchemas.id),
    lectureController.getChapterLectures
);

// Permissions & Access Routes
router.get('/:id/permissions',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    lectureController.getLecturePermissions
);

router.put('/:id/permissions',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    lectureController.updateLecturePermissions
);

router.get('/my-lectures',
    auth,
    lectureController.getMyLectures
);

module.exports = router;