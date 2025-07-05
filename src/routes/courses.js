const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { auth } = require('../middleware/auth');
const { requireAdmin, requireLecturer, requireSelfOrElevated, requireCourseInstructor, requireCourseEnrollment } = require('../middleware/roleCheck');
const { validate, validateQuery, validateParams } = require('../middleware/validation');
const { commonSchemas, courseSchemas } = require('../middleware/validation');



// POST /enrollment/bulk    
router.post('/enrollment/bulk',
    auth,
    requireLecturer, // Changed from requireAdmin to requireLecturer to allow teachers
    validate(courseSchemas.bulkEnrollment),
    courseController.bulkEnrollment
);

// GET /enrollment/export
router.get('/enrollment/export',
    auth,
    requireAdmin,
    courseController.exportEnrollment
);



// GET /classes 
router.get('/classes',
    auth,
    requireLecturer,
    validateQuery(commonSchemas.classPagination),
    courseController.getClasses
);

// POST /classes 
router.post('/classes',
    auth,
    requireLecturer,
    validate(courseSchemas.createClass),
    courseController.createClass
);

// GET /classes/:id 
router.get('/classes/:id',
    auth,
    requireCourseEnrollment,
    validateParams(commonSchemas.id),
    courseController.getClass
);

// PUT /classes/:id 
router.put('/classes/:id',
    auth,
    requireCourseInstructor,
    validateParams(commonSchemas.id),
    validate(courseSchemas.updateClass),
    courseController.updateClass
);

// DELETE /classes/:id 
router.delete('/classes/:id',
    auth,
    requireCourseInstructor,
    validateParams(commonSchemas.id),
    courseController.deleteClass
);

// GET /classes/:id/students 
router.get('/classes/:id/students',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    validateQuery(commonSchemas.pagination),
    courseController.getClassStudents
);

// GET /classes/:id/lectures 
router.get('/classes/:id/lectures',
    auth,
    validateParams(commonSchemas.id),
    validateQuery(commonSchemas.pagination),
    courseController.getClassLectures
);

// GET /classes/:id/materials 
router.get('/classes/:id/materials',
    auth,
    validateParams(commonSchemas.id),
    validateQuery(commonSchemas.pagination),
    courseController.getClassMaterials
);

// POST /classes/:id/students 
router.post('/classes/:id/students',
    auth,
    requireCourseInstructor,
    validateParams(commonSchemas.id),
    validate(courseSchemas.enrollStudents),
    courseController.enrollStudents
);

// DELETE /classes/:id/students/:studentId 
router.delete('/classes/:id/students/:studentId',
    auth,
    requireCourseInstructor,
    validateParams(courseSchemas.enrollmentParams),
    courseController.removeStudentFromClass
);

// GET /students/:id/classes 
router.get('/students/:id/classes',
    auth,
    requireSelfOrElevated,
    validateParams(commonSchemas.id),
    validateQuery(commonSchemas.pagination),
    courseController.getStudentClasses
);


// GET /courses 
router.get('/',
    auth,
    requireLecturer,
    validateQuery(commonSchemas.coursePagination),
    courseController.getCourses
);

// POST /courses 
router.post('/',
    auth,
    requireLecturer,
    validate(courseSchemas.createCourse),
    courseController.createCourse
);

// GET /courses/:id 
router.get('/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    courseController.getCourse
);

// PUT /courses/:id 
router.put('/:id',
    auth,
    requireCourseInstructor,
    validateParams(commonSchemas.id),
    validate(courseSchemas.updateCourse),
    courseController.updateCourse
);

// DELETE /courses/:id 
router.delete('/:id',
    auth,
    requireCourseInstructor,
    validateParams(commonSchemas.id),
    courseController.deleteCourse
);

// GET /courses/:id/students 
router.get('/:id/students',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    validateQuery(commonSchemas.pagination),
    courseController.getCourseStudents
);

module.exports = router; 
