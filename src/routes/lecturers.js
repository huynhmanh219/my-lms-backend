const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { auth } = require('../middleware/auth');
const { validateQuery } = require('../middleware/validation');
const { commonSchemas } = require('../middleware/validation');

// GET /lecturers/me/classes - Get current lecturer's classes
router.get('/me/classes',
    auth,
    validateQuery(commonSchemas.pagination),
    courseController.getCurrentLecturerClasses
);

module.exports = router; 