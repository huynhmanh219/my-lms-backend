// User Management Routes
// Routes for managing teachers, students, and roles

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { requireAdmin, requireLecturer } = require('../middleware/roleCheck');
const { validate, validateQuery, validateParams } = require('../middleware/validation');
const { userSchemas, commonSchemas } = require('../middleware/validation');
const { uploadLimiter } = require('../middleware/rateLimiter');
const upload = require('../config/multer');

// Teacher Management Routes
router.get('/teachers',
    auth,
    requireLecturer,
    validateQuery(commonSchemas.pagination),
    userController.getTeachers
);

router.get('/teachers/:id',
    auth,
    validateParams(commonSchemas.id),
    userController.getTeacher
);

router.post('/teachers',
    auth,
    requireAdmin,
    validate(userSchemas.createTeacher),
    userController.createTeacher
);

router.put('/teachers/:id',
    auth,
    requireAdmin,
    validateParams(commonSchemas.id),
    userController.updateTeacher
);

router.delete('/teachers/:id',
    auth,
    requireAdmin,
    validateParams(commonSchemas.id),
    userController.deleteTeacher
);

router.get('/teachers/export/excel',
    auth,
    requireAdmin,
    userController.exportTeachersExcel
);

router.post('/teachers/:id/avatar',
    auth,
    uploadLimiter,
    validateParams(commonSchemas.id),
    upload.single('avatar'),
    userController.uploadTeacherAvatar
);

// Student Management Routes
router.get('/students',
    auth,
    validateQuery(commonSchemas.pagination),
    userController.getStudents
);

router.get('/students/:id',
    auth,
    validateParams(commonSchemas.id),
    userController.getStudent
);

router.post('/students',
    auth,
    requireAdmin,
    validate(userSchemas.createStudent),
    userController.createStudent
);

router.put('/students/:id',
    auth,
    requireAdmin,
    validateParams(commonSchemas.id),
    userController.updateStudent
);

router.delete('/students/:id',
    auth,
    requireAdmin,
    validateParams(commonSchemas.id),
    userController.deleteStudent
);

router.post('/students/import/excel',
    auth,
    requireAdmin,
    uploadLimiter,
    upload.single('file'),
    userController.importStudentsExcel
);

router.get('/students/export/excel',
    auth,
    requireAdmin,
    userController.exportStudentsExcel
);

router.post('/students/:id/avatar',
    auth,
    uploadLimiter,
    validateParams(commonSchemas.id),
    upload.single('avatar'),
    userController.uploadStudentAvatar
);

// Role Management Routes
router.get('/roles',
    auth,
    userController.getRoles
);

module.exports = router; 