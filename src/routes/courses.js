// Course Management Routes
// Routes for managing subjects, classes, and enrollment

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { auth } = require('../middleware/auth');
const { requireAdmin, requireLecturer } = require('../middleware/roleCheck');
const { validateQuery, validateParams } = require('../middleware/validation');
const { commonSchemas } = require('../middleware/validation');

// Subject Management Routes
router.get('/',
    auth,
    validateQuery(commonSchemas.pagination),
    courseController.getCourses
);

router.get('/:id',
    auth,
    validateParams(commonSchemas.id),
    courseController.getCourse
);

router.post('/',
    auth,
    requireLecturer,
    courseController.createCourse
);

router.put('/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    courseController.updateCourse
);

router.delete('/:id',
    auth,
    requireAdmin,
    validateParams(commonSchemas.id),
    courseController.deleteCourse
);

router.get('/:id/students',
    auth,
    validateParams(commonSchemas.id),
    courseController.getCourseStudents
);

// Class Management Routes
router.get('/classes',
    auth,
    validateQuery(commonSchemas.pagination),
    courseController.getClasses
);

router.get('/classes/:id',
    auth,
    validateParams(commonSchemas.id),
    courseController.getClass
);

router.post('/classes',
    auth,
    requireLecturer,
    courseController.createClass
);

router.put('/classes/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    courseController.updateClass
);

router.delete('/classes/:id',
    auth,
    requireAdmin,
    validateParams(commonSchemas.id),
    courseController.deleteClass
);

// Enrollment Management Routes
router.get('/classes/:id/students',
    auth,
    validateParams(commonSchemas.id),
    courseController.getClassStudents
);

router.post('/classes/:id/students',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    courseController.enrollStudents
);

router.delete('/classes/:id/students/:studentId',
    auth,
    requireLecturer,
    courseController.removeStudentFromClass
);

router.get('/students/:id/classes',
    auth,
    validateParams(commonSchemas.id),
    courseController.getStudentClasses
);

router.post('/enrollment/bulk',
    auth,
    requireAdmin,
    courseController.bulkEnrollment
);

router.get('/enrollment/export',
    auth,
    requireAdmin,
    courseController.exportEnrollment
);

module.exports = router; 