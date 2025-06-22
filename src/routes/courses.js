// Course Management Routes
// Routes for managing subjects, classes, and enrollment

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { auth } = require('../middleware/auth');
const { requireAdmin, requireLecturer, requireSelfOrElevated, requireCourseInstructor } = require('../middleware/roleCheck');
const { validate, validateQuery, validateParams } = require('../middleware/validation');
const { commonSchemas, courseSchemas } = require('../middleware/validation');

// ==========================================
// ENROLLMENT MANAGEMENT ROUTES (7 APIs)
// ==========================================
// Put these first to avoid conflicts with parameterized routes

// POST /enrollment/bulk - Bulk enrollment
router.post('/enrollment/bulk',
    auth,
    requireAdmin, // Only admins can perform bulk enrollment
    validate(courseSchemas.bulkEnrollment),
    courseController.bulkEnrollment
);

// GET /enrollment/export - Export enrollment data
router.get('/enrollment/export',
    auth,
    requireAdmin, // Only admins can export enrollment data
    courseController.exportEnrollment
);

// ==========================================
// CLASS MANAGEMENT ROUTES (5 APIs)
// ==========================================
// Put class routes before parameterized routes to avoid conflicts

// GET /classes - Get course sections
router.get('/classes',
    auth,
    requireLecturer, // Lecturers and admins can view classes
    validateQuery(commonSchemas.classPagination),
    courseController.getClasses
);

// POST /classes - Create class
router.post('/classes',
    auth,
    requireAdmin, // Only admins can create classes
    validate(courseSchemas.createClass),
    courseController.createClass
);

// GET /classes/:id - Get single class
router.get('/classes/:id',
    auth,
    requireLecturer, // Lecturers and admins can view class details
    validateParams(commonSchemas.id),
    courseController.getClass
);

// PUT /classes/:id - Update class
router.put('/classes/:id',
    auth,
    requireAdmin, // Only admins can update classes (or class instructor)
    validateParams(commonSchemas.id),
    validate(courseSchemas.updateClass),
    courseController.updateClass
);

// DELETE /classes/:id - Delete class
router.delete('/classes/:id',
    auth,
    requireAdmin, // Only admins can delete classes
    validateParams(commonSchemas.id),
    courseController.deleteClass
);

// GET /classes/:id/students - Get students in a class
router.get('/classes/:id/students',
    auth,
    requireLecturer, // Lecturers and admins can view class students
    validateParams(commonSchemas.id),
    validateQuery(commonSchemas.pagination),
    courseController.getClassStudents
);

// POST /classes/:id/students - Enroll students to class
router.post('/classes/:id/students',
    auth,
    requireAdmin, // Only admins can enroll students (or class instructor)
    validateParams(commonSchemas.id),
    validate(courseSchemas.enrollStudents),
    courseController.enrollStudents
);

// DELETE /classes/:id/students/:studentId - Remove student from class
router.delete('/classes/:id/students/:studentId',
    auth,
    requireAdmin, // Only admins can remove students (or class instructor)
    validateParams(courseSchemas.enrollmentParams),
    courseController.removeStudentFromClass
);

// GET /students/:id/classes - Get classes of a student
router.get('/students/:id/classes',
    auth,
    requireSelfOrElevated, // Students can view their own classes, lecturers/admins can view any
    validateParams(commonSchemas.id),
    validateQuery(commonSchemas.pagination),
    courseController.getStudentClasses
);

// ==========================================
// SUBJECT MANAGEMENT ROUTES (6 APIs)
// ==========================================

// GET /courses - Get subjects with pagination
router.get('/',
    auth,
    requireLecturer, // Lecturers and admins can view courses
    validateQuery(commonSchemas.coursePagination),
    courseController.getCourses
);

// POST /courses - Create subject
router.post('/',
    auth,
    requireAdmin, // Only admins can create subjects
    validate(courseSchemas.createCourse),
    courseController.createCourse
);

// GET /courses/:id - Get single course
router.get('/:id',
    auth,
    requireLecturer, // Lecturers and admins can view course details
    validateParams(commonSchemas.id),
    courseController.getCourse
);

// PUT /courses/:id - Update course
router.put('/:id',
    auth,
    requireAdmin, // Only admins can update courses (or course instructor)
    validateParams(commonSchemas.id),
    validate(courseSchemas.updateCourse),
    courseController.updateCourse
);

// DELETE /courses/:id - Delete course
router.delete('/:id',
    auth,
    requireAdmin, // Only admins can delete courses
    validateParams(commonSchemas.id),
    courseController.deleteCourse
);

// GET /courses/:id/students - Get students enrolled in course
router.get('/:id/students',
    auth,
    requireLecturer, // Lecturers and admins can view course students
    validateParams(commonSchemas.id),
    validateQuery(commonSchemas.pagination),
    courseController.getCourseStudents
);

module.exports = router; 