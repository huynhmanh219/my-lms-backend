// User Management Routes
// Routes for managing teachers, students, and roles

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { requireAdmin, requireLecturer, requireSelfOrElevated } = require('../middleware/roleCheck');
const { validate, validateQuery, validateParams } = require('../middleware/validation');
const { userSchemas, commonSchemas } = require('../middleware/validation');
const { uploadLimiter } = require('../middleware/rateLimiter');
const upload = require('../config/multer');

// ==========================================
// TEACHER MANAGEMENT ROUTES (7 APIs)
// ==========================================

// GET /users/teachers - Get teachers with pagination, search, filters
router.get('/teachers',
    auth,
    requireLecturer, // Lecturers and admins can view teachers
    validateQuery(commonSchemas.teacherPagination),
    userController.getTeachers
);

// GET /users/teachers/export-excel - Export teachers to Excel (MUST come before /:id route)
router.get('/teachers/export-excel',
    auth,
    requireAdmin, // Only admins can export data
    userController.exportTeachersExcel
);

// GET /users/teachers/:id - Get single teacher
router.get('/teachers/:id',
    auth,
    requireLecturer, // Lecturers and admins can view teacher details
    validateParams(commonSchemas.id),
    userController.getTeacher
);

// POST /users/teachers - Create teacher (account + lecturer profile)
router.post('/teachers',
    auth,
    requireAdmin, // Only admins can create teachers
    validate(userSchemas.createTeacher),
    userController.createTeacher
);

// PUT /users/teachers/:id - Update teacher
router.put('/teachers/:id',
    auth,
    requireAdmin, // Only admins can update teacher accounts
    validateParams(commonSchemas.id),
    validate(userSchemas.updateTeacher),
    userController.updateTeacher
);

// DELETE /users/teachers/:id - Soft delete teacher
router.delete('/teachers/:id',
    auth,
    requireAdmin, // Only admins can delete teachers
    validateParams(commonSchemas.id),
    userController.deleteTeacher
);

// POST /users/teachers/:id/upload-avatar - Upload teacher avatar
router.post('/teachers/:id/upload-avatar',
    auth,
    requireSelfOrElevated, // Teachers can upload their own avatar, admins can upload any
    uploadLimiter,
    validateParams(commonSchemas.id),
    upload.single('avatar'),
    userController.uploadTeacherAvatar
);

// ==========================================
// STUDENT MANAGEMENT ROUTES (8 APIs)
// ==========================================

// GET /users/students - Get students with pagination, search, filters
router.get('/students',
    auth,
    requireLecturer, // Lecturers and admins can view students
    validateQuery(commonSchemas.studentPagination),
    userController.getStudents
);

// POST /users/students/import-excel - Import students from Excel (MUST come before /:id route)
router.post('/students/import-excel',
    auth,
    requireAdmin, // Only admins can import students
    uploadLimiter,
    upload.single('file'),
    userController.importStudentsExcel
);

// GET /users/students/export-excel - Export students to Excel (MUST come before /:id route)
router.get('/students/export-excel',
    auth,
    requireAdmin, // Only admins can export student data
    userController.exportStudentsExcel
);

// GET /users/students/:id - Get single student
router.get('/students/:id',
    auth,
    requireSelfOrElevated, // Students can view their own data, lecturers/admins can view any
    validateParams(commonSchemas.id),
    userController.getStudent
);

// POST /users/students - Create student (account + student profile)
router.post('/students',
    auth,
    requireAdmin, // Only admins can create student accounts
    validate(userSchemas.createStudent),
    userController.createStudent
);

// PUT /users/students/:id - Update student
router.put('/students/:id',
    auth,
    requireAdmin, // Only admins can update student accounts
    validateParams(commonSchemas.id),
    validate(userSchemas.updateStudent),
    userController.updateStudent
);

// DELETE /users/students/:id - Soft delete student
router.delete('/students/:id',
    auth,
    requireAdmin, // Only admins can delete students
    validateParams(commonSchemas.id),
    userController.deleteStudent
);

// POST /users/students/:id/upload-avatar - Upload student avatar
router.post('/students/:id/upload-avatar',
    auth,
    requireSelfOrElevated, // Students can upload their own avatar, admins/lecturers can upload any
    uploadLimiter,
    validateParams(commonSchemas.id),
    upload.single('avatar'),
    userController.uploadStudentAvatar
);

// ==========================================
// ROLE MANAGEMENT ROUTES (1 API)
// ==========================================

// GET /users/roles - Get all roles
router.get('/roles',
    auth, // All authenticated users can view roles
    userController.getRoles
);

module.exports = router; 