

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { auth } = require('../middleware/auth');
const { requireAdmin, requireLecturer, requireSelfOrElevated, requireCourseInstructor } = require('../middleware/roleCheck');
const { validate, validateQuery, validateParams } = require('../middleware/validation');
const { commonSchemas, courseSchemas } = require('../middleware/validation');



// POST /enrollment/bulk    
router.post('/enrollment/bulk',
    auth,
    requireAdmin,
    validate(courseSchemas.bulkEnrollment),
    courseController.bulkEnrollment
);

// GET /enrollment/export
router.get('/enrollment/export',
    auth,
    requireAdmin,
    courseController.exportEnrollment
);



// GET /classes - Get course sections
router.get('/classes',
    auth,
    requireLecturer,
    validateQuery(commonSchemas.classPagination),
    courseController.getClasses
);

// POST /classes - Create class
router.post('/classes',
    auth,
    requireLecturer,
    validate(courseSchemas.createClass),
    courseController.createClass
);

// GET /classes/:id - Get single class
router.get('/classes/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    courseController.getClass
);

// PUT /classes/:id - Update class
router.put('/classes/:id',
    auth,
    requireCourseInstructor,
    validateParams(commonSchemas.id),
    validate(courseSchemas.updateClass),
    courseController.updateClass
);

// DELETE /classes/:id - Delete class
router.delete('/classes/:id',
    auth,
    requireCourseInstructor,
    validateParams(commonSchemas.id),
    courseController.deleteClass
);

// GET /classes/:id/students - Get students in a class
router.get('/classes/:id/students',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    validateQuery(commonSchemas.pagination),
    courseController.getClassStudents
);

// POST /classes/:id/students - Enroll students to class
router.post('/classes/:id/students',
    auth,
    requireCourseInstructor,
    validateParams(commonSchemas.id),
    validate(courseSchemas.enrollStudents),
    courseController.enrollStudents
);

// DELETE /classes/:id/students/:studentId - Remove student from class
router.delete('/classes/:id/students/:studentId',
    auth,
    requireCourseInstructor,
    validateParams(courseSchemas.enrollmentParams),
    courseController.removeStudentFromClass
);

// GET /students/:id/classes - Get classes of a student
router.get('/students/:id/classes',
    auth,
    requireSelfOrElevated,
    validateParams(commonSchemas.id),
    validateQuery(commonSchemas.pagination),
    courseController.getStudentClasses
);


// GET /courses - Get subjects with pagination
router.get('/',
    auth,
    requireLecturer,
    validateQuery(commonSchemas.coursePagination),
    courseController.getCourses
);

// POST /courses - Create subject
router.post('/',
    auth,
    requireLecturer,
    validate(courseSchemas.createCourse),
    courseController.createCourse
);

// GET /courses/:id - Get single course
router.get('/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    courseController.getCourse
);

// PUT /courses/:id - Update course
router.put('/:id',
    auth,
    requireCourseInstructor,
    validateParams(commonSchemas.id),
    validate(courseSchemas.updateCourse),
    courseController.updateCourse
);

// DELETE /courses/:id - Delete course
router.delete('/:id',
    auth,
    requireCourseInstructor,
    validateParams(commonSchemas.id),
    courseController.deleteCourse
);

// GET /courses/:id/students - Get students enrolled in course
router.get('/:id/students',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    validateQuery(commonSchemas.pagination),
    courseController.getCourseStudents
);

module.exports = router; 