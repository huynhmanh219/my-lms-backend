﻿
const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/lectureController');
const { auth } = require('../middleware/auth');
const { requireLecturer, requireCourseInstructor } = require('../middleware/roleCheck');
const { validate, validateQuery, validateParams, validateBody } = require('../middleware/validation');
const { commonSchemas, lectureSchemas } = require('../middleware/validation');



router.get('/chapters',
    auth,
    validateQuery(lectureSchemas.chapterPagination),
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
    validate(lectureSchemas.createChapter),
    lectureController.createChapter
);

router.put('/chapters/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    validate(lectureSchemas.updateChapter),
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
    validateQuery(commonSchemas.pagination),
    lectureController.getChapterLectures
);


router.get('/my-lectures',
    auth,
    validateQuery(lectureSchemas.myLecturesPagination),
    lectureController.getMyLectures
);



router.get('/',
    auth,
    validateQuery(lectureSchemas.lecturePagination),
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
    validate(lectureSchemas.createLecture),
    lectureController.createLecture
);

router.put('/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    validate(lectureSchemas.updateLecture),
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
    validate(lectureSchemas.lecturePermissions),
    lectureController.updateLecturePermissions
);

module.exports = router;
