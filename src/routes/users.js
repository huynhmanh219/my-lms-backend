const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { requireAdmin, requireLecturer, requireSelfOrElevated } = require('../middleware/roleCheck');
const { validate, validateQuery, validateParams } = require('../middleware/validation');
const { userSchemas, commonSchemas } = require('../middleware/validation');
const { uploadLimiter } = require('../middleware/rateLimiter');
const upload = require('../config/multer');

// GET /users/profile 
router.get('/profile',
    auth,
    userController.getCurrentUserProfile
);

// PUT /users/profile 
router.put('/profile',
    auth,
    userController.updateCurrentUserProfile
);

// POST /users/profile/avatar
router.post('/profile/avatar',
    auth,
    uploadLimiter,
    upload.single('avatar'),
    userController.uploadCurrentUserAvatar
);

// GET /users/teachers 
router.get('/teachers',
    auth,
    requireLecturer,
    validateQuery(commonSchemas.teacherPagination),
    userController.getTeachers
);

// GET /users/teachers/export-excel
router.get('/teachers/export-excel',
    auth,
    requireAdmin,
    userController.exportTeachersExcel
);

// GET /users/teachers/:id
router.get('/teachers/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    userController.getTeacher
);

// POST /users/teachers
router.post('/teachers',
    auth,
    requireAdmin,
    validate(userSchemas.createTeacher),
    userController.createTeacher
);

// PUT /users/teachers/:id
router.put('/teachers/:id',
    auth,
    requireAdmin,
    validateParams(commonSchemas.id),
    validate(userSchemas.updateTeacher),
    userController.updateTeacher
);

// DELETE /users/teachers/:id
router.delete('/teachers/:id',
    auth,
    requireAdmin,
    validateParams(commonSchemas.id),
    userController.deleteTeacher
);

// POST /users/teachers/:id/upload-avatar
router.post('/teachers/:id/upload-avatar',
    auth,
    requireSelfOrElevated,
    uploadLimiter,
    validateParams(commonSchemas.id),
    upload.single('avatar'),
    userController.uploadTeacherAvatar
);

// GET /users/students
router.get('/students',
    auth,
    requireLecturer,
    validateQuery(commonSchemas.studentPagination),
    userController.getStudents
);

// POST /users/students/import-excel
router.post('/students/import-excel',
    auth,
    requireAdmin,
    uploadLimiter,
    upload.single('file'),
    userController.importStudentsExcel
);

// GET /users/students/export-excel
router.get('/students/export-excel',
    auth,
    requireAdmin,
    userController.exportStudentsExcel
);

// GET /users/students/:id
router.get('/students/:id',
    auth,
    requireSelfOrElevated,
    validateParams(commonSchemas.id),
    userController.getStudent
);

// POST /users/students
router.post('/students',
    auth,
    requireLecturer,
    validate(userSchemas.createStudent),
    userController.createStudent
);

// PUT /users/students/:id
router.put('/students/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    validate(userSchemas.updateStudent),
    userController.updateStudent
);

// DELETE /users/students/:id
router.delete('/students/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    userController.deleteStudent
);

// POST /users/students/:id/upload-avatar
router.post('/students/:id/upload-avatar',
    auth,
    requireSelfOrElevated,
    uploadLimiter,
    validateParams(commonSchemas.id),
    upload.single('avatar'),
    userController.uploadStudentAvatar
);

// GET /users/roles
router.get('/roles',
    auth,
    userController.getRoles
);

module.exports = router; 